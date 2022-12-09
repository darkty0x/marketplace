use crate::{
	domain::{ProjectDetails, UserInfo},
	presentation::graphql,
};
use ::domain::{
	AggregateRootRepository, Budget, EntityRepository, Event, Payment, Project, Publisher,
	UniqueMessage, UserRepository, UuidGenerator,
};
use anyhow::Result;
use http::Config;
use presentation::http;
use std::sync::Arc;

pub mod dto;
pub mod roles;
mod routes;

#[allow(clippy::too_many_arguments)]
pub async fn serve(
	config: Config,
	schema: graphql::Schema,
	uuid_generator: Arc<dyn UuidGenerator>,
	event_publisher: Arc<dyn Publisher<UniqueMessage<Event>>>,
	project_repository: AggregateRootRepository<Project>,
	payment_repository: AggregateRootRepository<Payment>,
	budget_repository: AggregateRootRepository<Budget>,
	user_repository: Arc<dyn UserRepository>,
	project_details_repository: Arc<dyn EntityRepository<ProjectDetails>>,
	user_info_repository: Arc<dyn EntityRepository<UserInfo>>,
) -> Result<()> {
	let _ = rocket::custom(http::config::rocket("api/Rocket.toml"))
		.manage(config)
		.manage(schema)
		.manage(uuid_generator)
		.manage(event_publisher)
		.manage(project_repository)
		.manage(payment_repository)
		.manage(budget_repository)
		.manage(user_repository)
		.manage(project_details_repository)
		.manage(user_info_repository)
		.attach(http::guards::Cors)
		.mount(
			"/",
			routes![
				http::routes::options_preflight_handler,
				http::routes::health_check,
			],
		)
		.mount(
			"/",
			routes![
				routes::graphql::graphiql,
				routes::graphql::get_graphql_handler,
				routes::graphql::post_graphql_handler
			],
		)
		.launch()
		.await?;

	Ok(())
}
