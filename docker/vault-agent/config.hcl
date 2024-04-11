auto_auth {
  method "approle" {
    config = {
      role_id_file_path   = "/etc/vault/role_id"
      secret_id_file_path = "/etc/vault/secret_id"
    }
  }

  sink "file" {
    config = {
      path = "/etc/vault/token_sink"
    }
  }
}
