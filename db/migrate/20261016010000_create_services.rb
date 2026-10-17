class CreateServices < ActiveRecord::Migration[8.1]
  def up
    create_table :services do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token, null: false
      t.string :name, null: false, limit: 80
      t.string :category, null: false, limit: 30
      t.decimal :price, precision: 10, scale: 2, null: false
      t.integer :duration_minutes, null: false, default: 30
      t.text :description
      t.boolean :active, null: false, default: true
      t.integer :legacy_id
      t.timestamps
    end
    add_index :services, :token, unique: true
    add_index :services, [:user_id, :name, :category], unique: true
    add_index :services, [:user_id, :legacy_id], unique: true
    defaults = [["Haircut", "Hair", 200, 30], ["Beard Trim", "Hair", 100, 15], ["Hair Color", "Hair", 800, 90], ["Head Massage", "Hair", 250, 30], ["Facial", "Skin", 700, 60], ["Cleanup", "Skin", 450, 30], ["Manicure", "Nails", 400, 45], ["Pedicure", "Nails", 500, 60]]
    service_model = Class.new(ActiveRecord::Base) { self.table_name = "services" }
    user_model = Class.new(ActiveRecord::Base) { self.table_name = "users" }
    user_model.find_each do |user|
      defaults.each_with_index do |(name, category, price, duration), index|
        service_model.create!(user_id: user.id, token: SecureRandom.base58(24), name: name, category: category, price: price, duration_minutes: duration, legacy_id: index + 1)
      end
    end
  end

  def down
    drop_table :services
  end
end