#!/usr/bin/env python3
"""
Manually add setter methods to classes where Lombok is failing
"""

import os
import re
from pathlib import Path

def add_manual_setters_to_result():
    """Add manual setter methods to Result class"""
    file_path = Path("blog-service/src/main/java/com/blog/common/Result.java")
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    content = file_path.read_text(encoding='utf-8')
    
    # Check if setters already exist
    if 'public void setCode(' in content:
        print("Result class already has manual setters")
        return
    
    # Add manual setter methods before the static methods
    setter_methods = '''
    // Manual setter methods (Lombok backup)
    public void setCode(Integer code) {
        this.code = code;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    // Manual getter methods (Lombok backup)
    public Integer getCode() {
        return code;
    }
    
    public String getMessage() {
        return message;
    }
    
    public T getData() {
        return data;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
'''
    
    # Insert setters before the first static method
    content = re.sub(
        r'(\s+)(public static <T> Result<T> success)',
        r'\1' + setter_methods + r'\n\1\2',
        content
    )
    
    file_path.write_text(content, encoding='utf-8')
    print("✅ Added manual setters to Result class")

def add_manual_setters_to_log_operation():
    """Add manual setter methods to LogOperation class"""
    file_path = Path("blog-service/src/main/java/com/blog/modules/system/log/model/entity/LogOperation.java")
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    content = file_path.read_text(encoding='utf-8')
    
    # Check if setters already exist
    if 'public void setUserId(' in content:
        print("LogOperation class already has manual setters")
        return
    
    # Add manual setter methods at the end of the class
    setter_methods = '''
    // Manual setter methods (Lombok backup)
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setOperation(String operation) { this.operation = operation; }
    public void setMethod(String method) { this.method = method; }
    public void setPath(String path) { this.path = path; }
    public void setParams(String params) { this.params = params; }
    public void setResult(String result) { this.result = result; }
    public void setIp(String ip) { this.ip = ip; }
    public void setDuration(Long duration) { this.duration = duration; }
    public void setStatus(Integer status) { this.status = status; }
    public void setErrorMsg(String errorMsg) { this.errorMsg = errorMsg; }
    public void setVersion(String version) { this.version = version; }
    public void setModule(String module) { this.module = module; }
    public void setCallingMethod(String callingMethod) { this.callingMethod = callingMethod; }
    public void setType(String type) { this.type = type; }
    public void setDescription(String description) { this.description = description; }
    public void setRequestUrl(String requestUrl) { this.requestUrl = requestUrl; }
    public void setRequestMethod(String requestMethod) { this.requestMethod = requestMethod; }
    public void setRequestParam(String requestParam) { this.requestParam = requestParam; }
    public void setResponseData(String responseData) { this.responseData = responseData; }
    public void setElapsedTime(Long elapsedTime) { this.elapsedTime = elapsedTime; }
    public void setDevice(String device) { this.device = device; }
    public void setBrowser(String browser) { this.browser = browser; }
    public void setIpSource(String ipSource) { this.ipSource = ipSource; }
'''
    
    # Insert setters before the closing brace
    content = re.sub(r'(\s*)}(\s*)$', r'\1' + setter_methods + r'\n\1}\2', content)
    
    file_path.write_text(content, encoding='utf-8')
    print("✅ Added manual setters to LogOperation class")

def add_manual_setters_to_log_error():
    """Add manual setter methods to LogError class"""
    file_path = Path("blog-service/src/main/java/com/blog/modules/system/log/model/entity/LogError.java")
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    content = file_path.read_text(encoding='utf-8')
    
    # Check if setters already exist
    if 'public void setUserId(' in content:
        print("LogError class already has manual setters")
        return
    
    # Add manual setter methods at the end of the class
    setter_methods = '''
    // Manual setter methods (Lombok backup)
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setExceptionType(String exceptionType) { this.exceptionType = exceptionType; }
    public void setExceptionMsg(String exceptionMsg) { this.exceptionMsg = exceptionMsg; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
    public void setMethod(String method) { this.method = method; }
    public void setPath(String path) { this.path = path; }
    public void setParams(String params) { this.params = params; }
    public void setIp(String ip) { this.ip = ip; }
    public void setVersion(String version) { this.version = version; }
    public void setRequestUrl(String requestUrl) { this.requestUrl = requestUrl; }
    public void setRequestMethod(String requestMethod) { this.requestMethod = requestMethod; }
    public void setRequestParam(String requestParam) { this.requestParam = requestParam; }
    public void setModule(String module) { this.module = module; }
    public void setCallingMethod(String callingMethod) { this.callingMethod = callingMethod; }
    public void setErrorName(String errorName) { this.errorName = errorName; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public void setIpSource(String ipSource) { this.ipSource = ipSource; }
    public void setDevice(String device) { this.device = device; }
    public void setBrowser(String browser) { this.browser = browser; }
'''
    
    # Insert setters before the closing brace
    content = re.sub(r'(\s*)}(\s*)$', r'\1' + setter_methods + r'\n\1}\2', content)
    
    file_path.write_text(content, encoding='utf-8')
    print("✅ Added manual setters to LogError class")

def fix_slf4j_logger_issues():
    """Fix missing log variable issues by ensuring proper @Slf4j annotation"""
    
    files_with_log_issues = [
        "blog-service/src/main/java/com/blog/core/aspect/LogAspect.java",
        "blog-service/src/main/java/com/blog/common/exception/GlobalExceptionHandler.java"
    ]
    
    for file_path_str in files_with_log_issues:
        file_path = Path(file_path_str)
        if not file_path.exists():
            continue
            
        content = file_path.read_text(encoding='utf-8')
        
        # Check if @Slf4j annotation exists
        if '@Slf4j' not in content:
            # Add @Slf4j import and annotation
            if 'import lombok.extern.slf4j.Slf4j;' not in content:
                content = re.sub(
                    r'(import lombok\..*?;)',
                    r'\1\nimport lombok.extern.slf4j.Slf4j;',
                    content,
                    count=1
                )
            
            # Add @Slf4j annotation before class declaration
            content = re.sub(
                r'(@Component|@RestControllerAdvice|@Aspect)\s*\n(public class)',
                r'@Slf4j\n\1\n\2',
                content
            )
            
            file_path.write_text(content, encoding='utf-8')
            print(f"✅ Added @Slf4j annotation to {file_path_str}")

def main():
    print("🔧 Adding manual setter methods as Lombok backup...")
    
    # Add manual setters to critical classes
    add_manual_setters_to_result()
    add_manual_setters_to_log_operation()
    add_manual_setters_to_log_error()
    
    # Fix logger issues
    fix_slf4j_logger_issues()
    
    print("\n✅ Manual setter methods added!")
    print("This should resolve the Lombok compilation issues.")

if __name__ == "__main__":
    main()