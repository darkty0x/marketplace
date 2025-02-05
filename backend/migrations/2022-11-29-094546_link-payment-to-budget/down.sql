ALTER TABLE payment_requests RENAME TO payment_requests_backup;

CREATE TABLE payment_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    requestor_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    amount_in_usd int8 NOT NULL,
    reason jsonb NOT NULL
);

INSERT INTO payment_requests
    SELECT payment_requests_backup.id, budgets.project_id, requestor_id, recipient_id, amount_in_usd, reason
    FROM payment_requests_backup
    JOIN budgets ON budgets.id = payment_requests_backup.budget_id;

ALTER TABLE payments
    DROP CONSTRAINT payments_request_id_fkey,
    ADD CONSTRAINT payments_request_id_fkey FOREIGN KEY (request_id) REFERENCES payment_requests(id);

DROP TABLE payment_requests_backup;
