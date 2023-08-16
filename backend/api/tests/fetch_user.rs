#[macro_use]
extern crate diesel;

use anyhow::Result;
use diesel::RunQueryDsl;
use rocket::http::{Header, Status};
use rstest::rstest;
use testcontainers::clients::Cli;

use olog::info;

use crate::context::{docker, utils::jwt, Context};

mod context;
mod models;

#[rstest]
#[tokio::test(flavor = "multi_thread")]
pub async fn fetch_user(docker: &'static Cli) {
	let mut test = Test {
		context: Context::new(docker).await.expect("Unable to create test context"),
	};

	// test.should_fetch_a_user_details_given_a_user_id()
	// 	.await
	// 	.expect("should_fetch_a_user_details_given_a_user_id");
	test.should_search_users_given_a_query_without_parameters()
		.await
		.expect("should_search_users_given_a_query_without_parameters");
}

struct Test<'a> {
	context: Context<'a>,
}

impl<'a> Test<'a> {
	async fn should_fetch_a_user_details_given_a_user_id(
		&mut self,
	) -> Result<()> {
		info!("should_fetch_a_user_details_given_a_user_id");
		// Given
		let resource = "/api/users/7793";

		// When
		let response = self
			.context
			.http_client
			.get(resource.to_string())
			.header(Header::new(
				"Authorization",
				format!("Bearer {}", jwt(None)),
			))
			.dispatch()
			.await;

		// Then
		assert_eq!(response.status(), Status::Ok);
		let user_details = response.into_string().await.unwrap();
		assert_eq!(
			user_details,
			"{\"id\":7793,\"login\":\"PierreOucif\",\"avatar_url\":\"https://avatars.githubusercontent.com/u/7793?v=4\",\"html_url\":\"https://github.com/PierreOucif\"}"
		);
		Ok(())
	}

	async fn should_search_users_given_a_query_without_parameters(
		&mut self,
	) -> Result<()> {
		info!("should_search_users_given_a_query_without_parameters");
		// Given
		let resource = "/api/users/search?query=Pierre";

		// When
		let response = self
			.context
			.http_client
			.get(resource.to_string())
			.header(Header::new(
				"Authorization",
				format!("Bearer {}", jwt(None)),
			))
			.dispatch()
			.await;

		// Then
		assert_eq!(response.status(), Status::Ok);
		let user_details = response.into_string().await.unwrap();
		assert_eq!(
			user_details,
			"[{\"id\":51940,\"login\":\"pierre\",\"avatar_url\":\"https://avatars.githubusercontent.com/u/51940?v=4\",\"html_url\":\"https://github.com/pierre\"},{\"id\":8023543,\"login\":\"turbo\",\"avatar_url\":\"https://avatars.githubusercontent.com/u/8023543?v=4\",\"html_url\":\"https://github.com/turbo\"}]"
		);
		Ok(())
	}


}
