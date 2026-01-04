package com.blog.modules.auth.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class ResetPasswordDTO {
    @NotBlank(message = "新密码不能为空")
    private String password;
    
    private String token;
    
    // Manual getter and setter methods (Lombok backup)
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}

