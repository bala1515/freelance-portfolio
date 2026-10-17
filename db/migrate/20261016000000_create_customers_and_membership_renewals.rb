class CreateCustomersAndMembershipRenewals < ActiveRecord::Migration[8.1]
  def up
    create_table :customers do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token, null: false
      t.string :name, null: false
      t.string :phone, null: false
      t.string :customer_type, null: false, default: "walk_in"
      t.date :membership_started_on
      t.date :membership_expires_on
      t.timestamps
    end
    add_index :customers, :token, unique: true
    add_index :customers, [:user_id, :phone], unique: true
    add_index :customers, [:user_id, :customer_type, :membership_expires_on], name: "index_customers_membership_status"

    create_table :membership_renewals do |t|
      t.references :customer, null: false, foreign_key: true
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :payment_method, null: false
      t.string :request_key, null: false
      t.date :starts_on, null: false
      t.date :expires_on, null: false
      t.timestamps
    end
    add_index :membership_renewals, :request_key, unique: true
    add_reference :billings, :customer, foreign_key: true
    add_column :billings, :membership_discount_applied, :boolean, default: false, null: false

    customer_model = Class.new(ActiveRecord::Base) { self.table_name = "customers" }
    billing_model = Class.new(ActiveRecord::Base) { self.table_name = "billings" }
    billing_model.reset_column_information
    billing_model.distinct.pluck(:user_id, :customer_phone).each do |user_id, phone|
      bills = billing_model.where(user_id: user_id, customer_phone: phone)
      latest = bills.order(created_at: :desc, id: :desc).first
      customer = customer_model.create!(user_id: user_id, token: SecureRandom.base58(24), name: latest.customer_name, phone: phone, customer_type: "walk_in", created_at: bills.minimum(:created_at), updated_at: latest.updated_at)
      bills.update_all(customer_id: customer.id)
    end
    change_column_null :billings, :customer_id, false
  end

  def down
    remove_column :billings, :membership_discount_applied
    remove_reference :billings, :customer, foreign_key: true
    drop_table :membership_renewals
    drop_table :customers
  end
end