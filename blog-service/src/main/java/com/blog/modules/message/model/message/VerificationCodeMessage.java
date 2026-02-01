package com.blog.modules.message.model.message;

import lombok.Data;

import java.io.Serializable;
import java.util.Map;

@Data
public class VerificationCodeMessage implements Serializable {
    private static final long serialVersionUID = 1L;

    private String email;
    private String subject;
    private String templateName;
    private Map<String, Object> variables;
}
