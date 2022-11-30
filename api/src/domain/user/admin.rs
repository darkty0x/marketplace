use super::User;
use domain::{BudgetId, ProjectId};

pub(super) struct Admin;

impl User for Admin {
	fn is_leader_on_project(&self, _project_id: &ProjectId) -> bool {
		true
	}

	fn can_spend_budget(&self, _budget_id: &BudgetId) -> bool {
		true
	}
}