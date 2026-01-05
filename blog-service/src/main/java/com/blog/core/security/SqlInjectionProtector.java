package com.blog.core.security;



import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import java.util.regex.Pattern;
/**
 * SQL注入防护组件
 */
@Component
public class SqlInjectionProtector {
    
    // SQL注入关键词模式（不区分大小写）
    private static final Pattern[] SQL_INJECTION_PATTERNS = {
        // 基本SQL注入模式
        Pattern.compile("(?i).*\\b(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\\b.*"),
        
        // 注释符号
        Pattern.compile("(?i).*(--|#|/\\*|\\*/).*"),
        
        // 单引号和分号组合
        Pattern.compile("(?i).*('|(\\\\')|('')|(\";)|(\\\\\")).*"),
        
        // 常见SQL注入payload
        Pattern.compile("(?i).*(or\\s+1\\s*=\\s*1|and\\s+1\\s*=\\s*1).*"),
        Pattern.compile("(?i).*(or\\s+'1'\\s*=\\s*'1'|and\\s+'1'\\s*=\\s*'1').*"),
        Pattern.compile("(?i).*(union\\s+select|union\\s+all\\s+select).*"),
        Pattern.compile("(?i).*(information_schema|mysql\\.|sys\\.).*"),
        
        // XSS相关
        Pattern.compile("(?i).*(<script|</script|javascript:|vbscript:|onload=|onerror=).*"),
        
        // 文件操作
        Pattern.compile("(?i).*(load_file|into\\s+outfile|into\\s+dumpfile).*"),
        
        // 系统函数
        Pattern.compile("(?i).*(system|exec|shell|cmd|eval).*")
    };
    
    // 危险字符模式
    private static final Pattern DANGEROUS_CHARS = Pattern.compile("[<>\"'%;()&+\\-]");
    
    /**
     * 检查字符串是否包含SQL注入
     */
    public boolean containsSqlInjection(String input) {
        if (!StringUtils.hasText(input)) {
            return false;
        }
        
        String cleanInput = input.trim();
        
        // 检查SQL注入模式
        for (Pattern pattern : SQL_INJECTION_PATTERNS) {
            if (pattern.matcher(cleanInput).matches()) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 检查是否包含XSS攻击
     */
    public boolean containsXss(String input) {
        if (!StringUtils.hasText(input)) {
            return false;
        }
        
        String lowerInput = input.toLowerCase();
        
        // 检查常见XSS模式
        String[] xssPatterns = {
            "<script", "</script", "javascript:", "vbscript:", "onload=", "onerror=",
            "onclick=", "onmouseover=", "onfocus=", "onblur=", "onchange=", "onsubmit=",
            "<iframe", "<object", "<embed", "<form", "eval(", "alert(", "confirm(",
            "prompt(", "document.cookie", "document.write", "window.location"
        };
        
        for (String pattern : xssPatterns) {
            if (lowerInput.contains(pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 清理危险字符
     */
    public String sanitizeInput(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        // 移除或转义危险字符
        return input
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#x27;")
            .replaceAll("&", "&amp;")
            .replaceAll("/", "&#x2F;");
    }
    
    /**
     * 验证参数安全性
     */
    public ValidationResult validateParameter(String paramName, String paramValue) {
        if (!StringUtils.hasText(paramValue)) {
            return ValidationResult.valid();
        }
        
        // 检查SQL注入
        if (containsSqlInjection(paramValue)) {
            return ValidationResult.invalid("参数 " + paramName + " 包含潜在的SQL注入攻击");
        }
        
        // 检查XSS
        if (containsXss(paramValue)) {
            return ValidationResult.invalid("参数 " + paramName + " 包含潜在的XSS攻击");
        }
        
        // 检查长度（防止DoS攻击）
        if (paramValue.length() > 10000) {
            return ValidationResult.invalid("参数 " + paramName + " 长度超过限制");
        }
        
        return ValidationResult.valid();
    }
    
    /**
     * 验证多个参数
     */
    public ValidationResult validateParameters(String... params) {
        if (params.length % 2 != 0) {
            throw new IllegalArgumentException("参数必须成对出现：参数名, 参数值");
        }
        
        for (int i = 0; i < params.length; i += 2) {
            String paramName = params[i];
            String paramValue = params[i + 1];
            
            ValidationResult result = validateParameter(paramName, paramValue);
            if (!result.isValid()) {
                return result;
            }
        }
        
        return ValidationResult.valid();
    }
    
    /**
     * 检查文件名安全性
     */
    public boolean isValidFileName(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return false;
        }
        
        // 检查危险字符
        String[] dangerousChars = {"..", "/", "\\", ":", "*", "?", "\"", "<", ">", "|"};
        for (String dangerousChar : dangerousChars) {
            if (fileName.contains(dangerousChar)) {
                return false;
            }
        }
        
        // 检查文件扩展名
        String[] dangerousExtensions = {
            ".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js", 
            ".jar", ".jsp", ".php", ".asp", ".aspx", ".sh"
        };
        
        String lowerFileName = fileName.toLowerCase();
        for (String ext : dangerousExtensions) {
            if (lowerFileName.endsWith(ext)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 验证结果类
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String message;
        
        private ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public static ValidationResult valid() {
            return new ValidationResult(true, null);
        }
        
        public static ValidationResult invalid(String message) {
            return new ValidationResult(false, message);
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getMessage() {
            return message;
        }
    }
}