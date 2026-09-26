# frozen_string_literal: true

# Prevents sensitive parameters from appearing in cleartext in Rails logs.
Rails.application.config.filter_parameters += %i[
  password passw secret token _key crypt salt certificate otp ssn
  authorization cvv card_number account_number upi_id
]
