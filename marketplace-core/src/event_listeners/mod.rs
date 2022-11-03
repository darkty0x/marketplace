use anyhow::Result;
use futures::future::join_all;
use marketplace_domain::{
	ApplicationProjector, ContributorWithGithubDataProjector, EventListener,
	GithubContributionProjector, GithubProjectProjector, LeadContributorProjector,
	ProjectMemberProjector,
};
use marketplace_infrastructure::{
	amqp::ConsumableBus,
	database::{self, init_pool},
	event_bus,
	event_webhook::EventWebHook,
	github,
};
use std::sync::Arc;
use tokio::task::JoinHandle;

mod logger;
mod projector;

pub async fn main() -> Result<()> {
	join_all(spawn_listeners().await?)
		.await
		.into_iter()
		.collect::<Result<Vec<()>, _>>()?;

	Ok(())
}

async fn spawn_listeners() -> Result<Vec<JoinHandle<()>>> {
	let database = Arc::new(database::Client::new(init_pool()?));
	let github = Arc::new(github::Client::new());
	let reqwest_client = reqwest::Client::new();

	let handles = [
		logger::spawn(event_bus::consumer().await?),
		ProjectMemberProjector::new(database.clone()).spawn(event_bus::consumer().await?),
		GithubContributionProjector::new(database.clone(), github.clone())
			.spawn(event_bus::consumer().await?),
		ApplicationProjector::new(database.clone()).spawn(event_bus::consumer().await?),
		GithubProjectProjector::new(github.clone(), database.clone())
			.spawn(event_bus::consumer().await?),
		ContributorWithGithubDataProjector::new(github, database.clone())
			.spawn(event_bus::consumer().await?),
		LeadContributorProjector::new(database.clone()).spawn(event_bus::consumer().await?),
		EventWebHook::new(reqwest_client).spawn(event_bus::consumer().await?),
	];

	Ok(handles.into())
}

trait Spawnable {
	fn spawn(self, bus: ConsumableBus) -> JoinHandle<()>;
}

impl<EL: EventListener + 'static> Spawnable for EL {
	fn spawn(self, bus: ConsumableBus) -> JoinHandle<()> {
		projector::spawn(bus, Arc::new(self))
	}
}
