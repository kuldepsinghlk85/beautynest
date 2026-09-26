# frozen_string_literal: true

Rails.application.routes.draw do
  root "home#index"
  get "/home", to: "home#index"
  get "/index2", to: "home#index2", as: :home_index2
  match "/switch_locale", to: "application#switch_locale", via: %i[get post], as: :switch_locale

  # Public static pages
  get "/categories",       to: "public_pages#categories",        as: :public_categories
  get "/categories/:slug", to: "public_pages#category_detail",   as: :public_category_detail
  # Legacy alias — keep old /services links working
  get "/services",              to: redirect("/categories")
  get "/services/:category_id", to: redirect { |p, _req| "/categories/#{p[:category_id]}" }
  get "/beauticians", to: "public_pages#beauticians",  as: :public_beauticians
  get "/offers",      to: "public_pages#offers",       as: :public_offers
  get "/about",       to: "public_pages#about",        as: :public_about
  get "/contact",     to: "public_pages#contact",      as: :public_contact
  get "/privacy",     to: "public_pages#privacy",      as: :public_privacy

  # Server-Side Rendered Cart & Checkout
  resource :cart, only: %i[show destroy], controller: "carts" do
    post   "items",     to: "carts#add_item",      as: :add_item
    patch  "items/:id", to: "carts#update_item",   as: :update_item
    delete "items/:id", to: "carts#remove_item",   as: :remove_item
    delete "clear",     to: "carts#clear",         as: :clear
    post   "coupon",    to: "carts#apply_coupon",  as: :apply_coupon
    delete "coupon",    to: "carts#remove_coupon", as: :remove_coupon
  end

  get "/checkout", to: "checkouts#new", as: :checkout_page
  resource :checkout, only: %i[new create], controller: "checkouts" do
    get "success/:id", to: "checkouts#success", as: :success
  end
  # Authentication & Registration
  get    "/login",    to: "sessions#new",          as: :login
  post   "/login",    to: "sessions#create"
  match  "/logout",   to: "sessions#destroy",      via: %i[get delete], as: :logout
  match  "/switch_customer_demo", to: "sessions#demo_customer_login", via: %i[get post], as: :switch_customer_demo
  get    "/signup",   to: "registrations#new",     as: :signup
  post   "/signup",   to: "registrations#create"
  get    "/register", to: "registrations#new"
  get    "/dev_auth_admin", to: "sessions#dev_auth_admin" if Rails.env.development?
  if Rails.env.development?
    get "/dev_auth_customer", to: ->(env) {
      req = ActionDispatch::Request.new(env)
      cust = User.customers.first
      req.session[:user_id] = cust.id
      cart = cust.cart || cust.create_cart!
      svc = Service.first
      if cart.cart_items.empty? && svc
        cart.cart_items.create!(
          service: svc,
          quantity: 1,
          booking_date: Date.current + 1.day,
          time_slot: "02:00 PM - 03:00 PM"
        )
      end
      [302, { "Location" => (req.params["return_to"].presence || "/cart") }, []]
    }
  end

  # Password reset flow
  get   "/forgot_password",        to: "passwords#new",    as: :forgot_password
  post  "/forgot_password",        to: "passwords#create"
  get   "/reset_password/:token",  to: "passwords#edit",   as: :reset_password
  post  "/reset_password/:token",  to: "passwords#update"
  patch "/reset_password/:token",  to: "passwords#update"

  # Public worker invitation accept flow
  get  "/worker_invitations/accept/:token", to: "worker_invitation_accepts#show", as: :worker_invitation_accept
  post "/worker_invitations/accept/:token", to: "worker_invitation_accepts#update"
  # Customer Area (Profile, Addresses, Bookings)
  get    "/profile",                       to: "customer/profiles#show",             as: :customer_profile
  patch  "/profile",                       to: "customer/profiles#update"
  patch  "/profile/password",              to: "customer/profiles#update_password",  as: :customer_password
  post   "/profile/addresses",             to: "customer/profiles#create_address",   as: :customer_addresses
  patch  "/profile/addresses/:id",         to: "customer/profiles#update_address",   as: :customer_address
  delete "/profile/addresses/:id",         to: "customer/profiles#destroy_address"
  patch  "/profile/addresses/:id/default", to: "customer/profiles#set_default_address", as: :customer_default_address

  get    "/my-bookings",                   to: "customer/bookings#index",            as: :customer_bookings
  get    "/my-bookings/:id",               to: "customer/bookings#show",             as: :customer_booking
  patch  "/my-bookings/:id/cancel",        to: "customer/bookings#cancel",           as: :cancel_customer_booking
  post   "/my-bookings/:id/review",        to: "customer/bookings#review",           as: :review_customer_booking

  # Admin control panel
  namespace :admin do
    root to: "dashboard#index"
    get  "dashboard",     to: "dashboard#index",     as: :dashboard
    resources :customers, only: %i[index show destroy] do
      member do
        patch :toggle_status
      end
    end
    resources :workers,            only: %i[index show new create edit update destroy]
    resources :worker_invitations, only: %i[index new create] do
      member do
        post  :resend
        patch :revoke
      end
    end
    resources :categories, only: %i[index show new create edit update destroy] do
      resources :subcategories, only: %i[index new create]
      resources :services, only: %i[index new create]
    end
    resources :subcategories, only: %i[index show new create edit update destroy] do
      resources :services, only: %i[index new create]
    end
    resources :services, only: %i[index show new create edit update destroy]
    resources :service_city_prices, only: %i[index new create edit update destroy]
    resources :cities, only: %i[index show new create edit update destroy]
    resources :bookings,      only: %i[index show new create edit update] do
      member do
        match :accept, via: %i[patch post]
        match :reject, via: %i[patch post]
        match :complete_service, via: %i[patch post]
        match :complete_payment, via: %i[patch post]
        post :approve_reschedule
        post :reassign_reschedule
        post :reject_reschedule
      end
      resources :extra_charges, only: %i[create], controller: "bookings/extra_charges" do
        collection do
          get :search_services
          get :search_products
        end
        member do
          patch :approve
          patch :reject
        end
      end
    end
    resources :payments,      only: %i[index show new create edit update]
    resources :coupons do
      member do
        patch :toggle_status
      end
    end
    resources :reviews,       only: %i[index show new create edit update destroy]
    resources :notifications, only: %i[index show new create edit update destroy] do
      collection { get :unread_count }
    end
    resources :audit_logs,    only: %i[index show]
    resource  :settings,      only: %i[show edit update], controller: "settings"
    get  "backup/export", to: "backups#export", as: :backup_export
    post "backup/import", to: "backups#import", as: :backup_import
  end

  # Mobile REST API
  namespace :api do
    namespace :v1 do
      # Shared auth (customer + worker use the same controller, role enforced by JWT claim)
      scope :auth, controller: "auth" do
        post   "register"
        post   "login"
        post   "refresh"
        post   "refresh_token", to: "auth#refresh"
        delete "logout"
        get    "me"
        get    "profile", to: "auth#me"
        patch  "password", to: "auth#update_password"
        put    "password", to: "auth#update_password"
      end

      # Dedicated Profile endpoints (/api/v1/profile)
      get   "profile",          to: "auth#me"
      patch "profile",          to: "auth#update_profile"
      put   "profile",          to: "auth#update_profile"
      patch "profile/password", to: "auth#update_password"
      put   "profile/password", to: "auth#update_password"

      # Customer addresses
      scope :customers do
        resources :addresses, only: %i[index create update destroy]
      end

      # Booking Flow helpers: date & time-slot availability and consent policy
      scope :booking_flow, controller: "booking_flow" do
        get :dates
        get :time_slots
        get :workers
        get :consent_form
        get :worker_availability
      end

      # Dedicated Booking Reviews (/api/v1/booking/reviews)
      scope "booking", as: :booking do
        resources :reviews, only: %i[index show create]
      end

      # Dedicated Service Reviews (/api/v1/service/reviews)
      scope "service", as: :service do
        resources :reviews, controller: "service_reviews", only: %i[index show create]
      end

      # Customer Wishlist & Favorites (/api/v1/wishlist and /api/v1/favorites)
      scope :wishlist, controller: "wishlist" do
        get    "/",      to: "wishlist#index"
        post   "/",      to: "wishlist#create"
        post   "toggle", to: "wishlist#toggle"
        get    "check",  to: "wishlist#check"
        delete "/",      to: "wishlist#clear"
        delete ":id",    to: "wishlist#destroy"
      end

      scope :favorites, controller: "wishlist" do
        get    "/",      to: "wishlist#index"
        post   "/",      to: "wishlist#create"
        post   "toggle", to: "wishlist#toggle"
        get    "check",  to: "wishlist#check"
        delete "/",      to: "wishlist#clear"
        delete ":id",    to: "wishlist#destroy"
      end

      # Cart & Checkout (/api/v1/cart)
      resource :cart, only: %i[show], controller: "carts" do
        post :checkout
        resources :items, only: %i[create update destroy], controller: "cart_items"
        delete "items", to: "cart_items#destroy_all", as: :clear_items
      end

      resources :bookings, only: %i[index show create] do
        member do
          patch :cancel
          post  :review
          get   :cost_summary
        end
      end
      resources :reviews, only: %i[index show create]
      resources :categories, only: %i[index show] do
        resources :subcategories, only: :index
        resources :services, only: :index
      end
      resources :subcategories, only: %i[index show] do
        resources :services, only: :index
      end
      resources :cities, only: %i[index show]
      resources :workers, only: %i[index show] do
        collection do
          get :top
        end
      end
      resources :coupons, only: %i[index show] do
        collection do
          post :validate
          post :apply
        end
      end
      resources :services, only: %i[index show] do
        collection do
          get :search
        end
        resources :reviews, controller: "service_reviews", only: %i[index create]
      end
      get "search", to: "services#search"
      get "stats",  to: "stats#index"

      # Notifications (Customer + Worker)
      resources :notifications, only: %i[index show destroy] do
        collection do
          patch :read_all
          get   :unread_count
        end
        member { patch :read }
      end

      # Worker namespace
      namespace :worker do
        scope :auth, controller: "/api/v1/auth" do
          post   "login"
          post   "refresh"
          post   "refresh_token", to: "/api/v1/auth#refresh"
          delete "logout"
          get    "me",      to: "/api/v1/auth#me"
          get    "profile", to: "/api/v1/auth#me"
          patch  "profile",  to: "/api/v1/auth#update_profile"
          put    "profile",  to: "/api/v1/auth#update_profile"
          patch  "password", to: "/api/v1/auth#update_password"
          put    "password", to: "/api/v1/auth#update_password"
        end

        patch "profile/password", to: "/api/v1/auth#update_password"
        put   "profile/password", to: "/api/v1/auth#update_password"

        resource  :profile, only: %i[show update], controller: "profiles"
        resource  :availability, only: %i[show update], controller: "availabilities"
        resources :bookings, only: %i[index show] do
          member do
            match :update_status, via: %i[patch post]
            match :status, to: "bookings#update_status", via: %i[patch post]
            match :accept, via: %i[patch post]
            match :reject, via: %i[patch post]
            match :complete_service, via: %i[patch post]
            match :complete_payment, via: %i[patch post]
            match :request_reschedule, via: %i[patch post]
            get   :reschedule_requests
          end
          resources :extra_charges, only: %i[index create], controller: "/api/v1/worker/extra_charges"
        end
        resources :earnings, only: :index
        resources :reviews,  only: %i[index show]
      end
    end
  end

  get "up", to: "rails/health#show", as: :rails_health_check

  # CORS Preflight handler
  match "*path", to: "application#cors_preflight_check", via: :options
end
