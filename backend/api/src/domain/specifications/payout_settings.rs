use std::sync::Arc;

use anyhow::{anyhow, Result};
use derive_more::Constructor;
use domain::EthereumIdentity;
#[cfg(test)]
use mockall::mock;

use crate::{infrastructure::web3::ens, models::PayoutSettings};

#[derive(Constructor)]
pub struct IsValid {
	ens_client: Arc<ens::Client>,
}

impl IsValid {
	pub async fn is_satisfied_by(&self, payout_settings: &PayoutSettings) -> Result<bool> {
		match payout_settings {
			PayoutSettings::EthTransfer(EthereumIdentity::Name(ens_name)) => {
				match self.ens_client.eth_address(ens_name.as_str()).await {
					Ok(_) => Ok(true),
					Err(ens::Error::NotRegistered) => Ok(false),
					Err(error) => Err(anyhow!(error)),
				}
			},
			_ => Ok(true),
		}
	}
}

#[cfg(test)]
mock! {
	pub IsValid {
		pub fn new(ens_client: Arc<ens::Client>) -> Self;
		pub async fn is_satisfied_by(&self, payout_settings: &PayoutSettings) -> Result<bool>;
	}
}

#[cfg(test)]
mod tests {
	use domain::EthereumName;
	use mockall::predicate::eq;
	use rstest::{fixture, rstest};

	use super::*;

	const ENS_NAME: &str = "vitalik.eth";

	#[fixture]
	fn eth_name() -> PayoutSettings {
		PayoutSettings::EthTransfer(EthereumIdentity::Name(EthereumName::new(String::from(
			ENS_NAME,
		))))
	}

	#[rstest]
	#[tokio::test]
	async fn valid_ens(eth_name: PayoutSettings) {
		let mut ens_client = ens::Client::default();
		ens_client
			.expect_eth_address()
			.once()
			.with(eq(ENS_NAME))
			.returning(|_| Ok(Default::default()));

		let result = IsValid::new(Arc::new(ens_client)).is_satisfied_by(&eth_name).await;
		assert!(result.is_ok(), "{}", result.err().unwrap());
		assert!(result.unwrap());
	}

	#[rstest]
	#[tokio::test]
	async fn invalid_ens(eth_name: PayoutSettings) {
		let mut ens_client = ens::Client::default();
		ens_client
			.expect_eth_address()
			.once()
			.with(eq(ENS_NAME))
			.returning(|_| Err(ens::Error::NotRegistered));

		let result = IsValid::new(Arc::new(ens_client)).is_satisfied_by(&eth_name).await;
		assert!(result.is_ok(), "{}", result.err().unwrap());
		assert!(!result.unwrap());
	}

	#[rstest]
	#[tokio::test]
	async fn ens_error(eth_name: PayoutSettings) {
		let mut ens_client = ens::Client::default();
		ens_client
			.expect_eth_address()
			.once()
			.with(eq(ENS_NAME))
			.returning(|_| Err(ens::Error::Contract(anyhow!("Unable to call ENS contract"))));

		let result = IsValid::new(Arc::new(ens_client)).is_satisfied_by(&eth_name).await;
		assert!(result.is_err());
	}
}
