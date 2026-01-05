package com.blog.plugin.email;


import java.util.Map;
public interface EmailProviderPlugin {
    void sendEmail(String to, String subject, String content) throws Exception;
    
    void sendEmailWithTemplate(String to, String subject, String templateName, Map<String, Object> variables) throws Exception;
}
