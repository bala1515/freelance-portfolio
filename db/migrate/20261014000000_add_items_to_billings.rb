class AddItemsToBillings < ActiveRecord::Migration[8.1]
  def change
    add_column :billings, :items, :json
  end
end
