Rails.application.routes.draw do
  devise_for :users

  namespace :api do
    get "lxqrmvntzhkpcas/staff", to: "/staff_members#list"
    post "lxqrmvntzhkpcas/staff", to: "/staff_members#create"
    patch "lxqrmvntzhkpcas/staff/:token", to: "/staff_members#update"
    get "rxqmvtnzhklpcas/reports", to: "/reports#summary"
    get "pxhtrqvnmzklsac/services", to: "/services#list"
    post "pxhtrqvnmzklsac/services", to: "/services#create"
    patch "pxhtrqvnmzklsac/services/:token", to: "/services#update"
    get "htrqzvlncpxmkas/customers/lookup", to: "/customers#lookup"
    get "htrqzvlncpxmkas/customers", to: "/customers#list"
    post "htrqzvlncpxmkas/customers", to: "/customers#create"
    get "htrqzvlncpxmkas/customers/:token", to: "/customers#show"
    post "htrqzvlncpxmkas/customers/:token/renew", to: "/customers#renew"
    post "kmxgyaevmqogavk/create_bill", to: "/billing#create_update_bill"
    get "wyaglkrsuzjlfax/bill_history", to: "/billing#bill_history"
    get "zvpkqndtxhrmfls/bills/:token", to: "/billing#show"
    patch "zvpkqndtxhrmfls/bills/:token", to: "/billing#update"
  end
  get "tqzprmvlhcnxkas/customers/walk-ins", to: "customers#index", defaults: { kind: "walk_in" }
  get "tqzprmvlhcnxkas/customers/members", to: "customers#index", defaults: { kind: "member" }
  get "yqnvtxpkrmhlzcs/services", to: "services#index"
  get "mztqvnrkphxlcas/staff", to: "staff_members#index"
  get "vhqntzmrkpxlcas/reports", to: "reports#index"
  get "home/index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
  get "bkqvntzmxprlcas/dashboard", to: "home#index", as: :workspace_dashboard
  root "landing#index"
  get "work/salon-billing-app", to: "landing#newbilling", as: :salon_billing_case_study
  get "qmnrofoqrygpvip/billing", to: "billing#index"
end
