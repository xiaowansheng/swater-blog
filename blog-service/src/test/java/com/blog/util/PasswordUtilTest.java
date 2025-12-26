package com.blog.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 密码工具类测试
 */
@DisplayName("密码工具类测试")
class PasswordUtilTest {
    
    @Test
    @DisplayName("密码加密 - 成功")
    void encode_Success() {
        // Given
        String rawPassword = "123456";
        
        // When
        String encodedPassword = PasswordUtil.encode(rawPassword);
        
        // Then
        assertThat(encodedPassword).isNotNull();
        assertThat(encodedPassword).isNotEqualTo(rawPassword);
        assertThat(encodedPassword).startsWith("$2a$");
        assertThat(encodedPassword.length()).isGreaterThan(50);
    }
    
    @Test
    @DisplayName("密码验证 - 正确密码")
    void matches_CorrectPassword_ReturnsTrue() {
        // Given
        String rawPassword = "123456";
        String encodedPassword = PasswordUtil.encode(rawPassword);
        
        // When
        boolean matches = PasswordUtil.matches(rawPassword, encodedPassword);
        
        // Then
        assertThat(matches).isTrue();
    }
    
    @Test
    @DisplayName("密码验证 - 错误密码")
    void matches_WrongPassword_ReturnsFalse() {
        // Given
        String rawPassword = "123456";
        String wrongPassword = "654321";
        String encodedPassword = PasswordUtil.encode(rawPassword);
        
        // When
        boolean matches = PasswordUtil.matches(wrongPassword, encodedPassword);
        
        // Then
        assertThat(matches).isFalse();
    }
    
    @ParameterizedTest
    @ValueSource(strings = {"", " ", "  "})
    @DisplayName("密码加密 - 空密码应该失败")
    void encode_EmptyPassword_ShouldFail(String emptyPassword) {
        // When & Then
        assertThatThrownBy(() -> PasswordUtil.encode(emptyPassword))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("密码不能为空");
    }
    
    @Test
    @DisplayName("密码验证 - 空密码应该失败")
    void matches_EmptyPassword_ShouldFail() {
        // Given
        String encodedPassword = PasswordUtil.encode("123456");
        
        // When & Then
        assertThatThrownBy(() -> PasswordUtil.matches("", encodedPassword))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("密码不能为空");
    }
    
    @Test
    @DisplayName("密码验证 - 空编码密码应该失败")
    void matches_EmptyEncodedPassword_ShouldFail() {
        // When & Then
        assertThatThrownBy(() -> PasswordUtil.matches("123456", ""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("编码密码不能为空");
    }
    
    @Test
    @DisplayName("相同密码多次加密结果不同")
    void encode_SamePasswordMultipleTimes_DifferentResults() {
        // Given
        String password = "123456";
        
        // When
        String encoded1 = PasswordUtil.encode(password);
        String encoded2 = PasswordUtil.encode(password);
        
        // Then
        assertThat(encoded1).isNotEqualTo(encoded2);
        assertThat(PasswordUtil.matches(password, encoded1)).isTrue();
        assertThat(PasswordUtil.matches(password, encoded2)).isTrue();
    }
    
    @ParameterizedTest
    @ValueSource(strings = {
        "123456",
        "password",
        "admin123",
        "qwerty",
        "P@ssw0rd123",
        "中文密码123",
        "!@#$%^&*()",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" // 长密码
    })
    @DisplayName("各种密码格式测试")
    void encode_VariousPasswordFormats_Success(String password) {
        // When
        String encoded = PasswordUtil.encode(password);
        
        // Then
        assertThat(encoded).isNotNull();
        assertThat(PasswordUtil.matches(password, encoded)).isTrue();
    }
}