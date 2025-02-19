use diesel_derive_enum::DbEnum;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, DbEnum)]
#[ExistingTypePath = "crate::database::schema::sql_types::AllocatedTime"]
pub enum AllocatedTime {
	None,
	Lt1day,
	_1to3days,
	Gt3days,
}
