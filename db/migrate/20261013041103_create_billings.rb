class CreateBillings < ActiveRecord::Migration[8.1]
  def change
    create_table :billings do |t|
      t.references :user, null: false, foreign_key: true
      t.string  :customer_name,  null: false
      t.string  :customer_phone, null: false
      t.string  :service,        null: false
      t.decimal :subtotal, precision: 10, scale: 2, null: false
      t.decimal :discount, precision: 10, scale: 2, null: false, default: 0
      t.string  :discount_type,  null: false, default: "flat"
      t.boolean :gst,            null: false, default: false
      t.decimal :tax,   precision: 10, scale: 2, null: false, default: 0
      t.decimal :total, precision: 10, scale: 2, null: false
      t.string  :payment_method, null: false
      t.string  :token,          null: false

      t.timestamps
    end

    add_index :billings, :token, unique: true
  end
end