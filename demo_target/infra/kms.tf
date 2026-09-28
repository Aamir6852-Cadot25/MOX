resource "aws_kms_key" "portal_signing" {
  description = "portal signing key"
  key_usage   = "SIGN_VERIFY"
  key_spec    = "RSA_2048"
}
