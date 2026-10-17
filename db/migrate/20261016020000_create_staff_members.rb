class CreateStaffMembers < ActiveRecord::Migration[8.1]
  def up
    create_table :staff_members do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token, null: false
      t.string :name, null: false, limit: 100
      t.string :role, null: false, default: "Stylist", limit: 60
      t.string :phone
      t.string :email
      t.date :joined_on, null: false
      t.boolean :active, null: false, default: true
      t.integer :legacy_id
      t.timestamps
    end
    add_index :staff_members, :token, unique: true
    add_index :staff_members, [:user_id, :phone], unique: true
    add_index :staff_members, [:user_id, :legacy_id], unique: true
    staff_model = Class.new(ActiveRecord::Base) { self.table_name = "staff_members" }
    user_model = Class.new(ActiveRecord::Base) { self.table_name = "users" }
    billing_model = Class.new(ActiveRecord::Base) { self.table_name = "billings" }
    user_model.find_each do |user|
      members = ["Ravi", "Priya", "Karthik"].each_with_index.map do |name, index|
        staff_model.create!(user_id: user.id, token: SecureRandom.base58(24), name: name, role: "Stylist", joined_on: user.created_at.in_time_zone("Asia/Kolkata").to_date, legacy_id: index + 1)
      end
      billing_model.where(user_id: user.id).find_each do |bill|
        next unless bill.items.is_a?(Array)
        changed = false
        updated = bill.items.map do |item|
          member = members.find { |person| person.legacy_id.to_s == item["staff_id"].to_s }
          next item unless member
          changed = true
          item.merge("staff_id" => member.token, "staff_name" => member.name)
        end
        bill.update_columns(items: updated) if changed
      end
    end
  end

  def down
    drop_table :staff_members
  end
end