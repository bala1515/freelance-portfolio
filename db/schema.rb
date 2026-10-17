# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_16_020000) do
  create_table "billings", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "customer_name", null: false
    t.string "customer_phone", null: false
    t.string "service", null: false
    t.decimal "subtotal", precision: 10, scale: 2, null: false
    t.decimal "discount", precision: 10, scale: 2, default: "0.0", null: false
    t.string "discount_type", default: "flat", null: false
    t.boolean "gst", default: false, null: false
    t.decimal "tax", precision: 10, scale: 2, default: "0.0", null: false
    t.decimal "total", precision: 10, scale: 2, null: false
    t.string "payment_method", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "items"
    t.bigint "customer_id", null: false
    t.boolean "membership_discount_applied", default: false, null: false
    t.index ["customer_id"], name: "index_billings_on_customer_id"
    t.index ["token"], name: "index_billings_on_token", unique: true
    t.index ["user_id"], name: "index_billings_on_user_id"
  end

  create_table "customers", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token", null: false
    t.string "name", null: false
    t.string "phone", null: false
    t.string "customer_type", default: "walk_in", null: false
    t.date "membership_started_on"
    t.date "membership_expires_on"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_customers_on_token", unique: true
    t.index ["user_id", "customer_type", "membership_expires_on"], name: "index_customers_membership_status"
    t.index ["user_id", "phone"], name: "index_customers_on_user_id_and_phone", unique: true
    t.index ["user_id"], name: "index_customers_on_user_id"
  end

  create_table "membership_renewals", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "customer_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "payment_method", null: false
    t.string "request_key", null: false
    t.date "starts_on", null: false
    t.date "expires_on", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_membership_renewals_on_customer_id"
    t.index ["request_key"], name: "index_membership_renewals_on_request_key", unique: true
  end

  create_table "services", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token", null: false
    t.string "name", limit: 80, null: false
    t.string "category", limit: 30, null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.integer "duration_minutes", default: 30, null: false
    t.text "description"
    t.boolean "active", default: true, null: false
    t.integer "legacy_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_services_on_token", unique: true
    t.index ["user_id", "legacy_id"], name: "index_services_on_user_id_and_legacy_id", unique: true
    t.index ["user_id", "name", "category"], name: "index_services_on_user_id_and_name_and_category", unique: true
    t.index ["user_id"], name: "index_services_on_user_id"
  end

  create_table "staff_members", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token", null: false
    t.string "name", limit: 100, null: false
    t.string "role", limit: 60, default: "Stylist", null: false
    t.string "phone"
    t.string "email"
    t.date "joined_on", null: false
    t.boolean "active", default: true, null: false
    t.integer "legacy_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_staff_members_on_token", unique: true
    t.index ["user_id", "legacy_id"], name: "index_staff_members_on_user_id_and_legacy_id", unique: true
    t.index ["user_id", "phone"], name: "index_staff_members_on_user_id_and_phone", unique: true
    t.index ["user_id"], name: "index_staff_members_on_user_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "billings", "customers"
  add_foreign_key "billings", "users"
  add_foreign_key "customers", "users"
  add_foreign_key "membership_renewals", "customers"
  add_foreign_key "services", "users"
  add_foreign_key "staff_members", "users"
end
