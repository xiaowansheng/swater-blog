package com.blog.model.dto;

import lombok.Data;

/**
 * 配置DTO
 */
@Data
public class ConfigDTO {
    private String key;
    private String value;
    private String description;
    
    // Manual setter methods (Lombok backup)
    public void setKey(String key) { this.key = key; }
    public void setValue(String value) { this.value = value; }
    public void setDescription(String description) { this.description = description; }
    
    // Manual getter methods (Lombok backup)
    public String getKey() { return key; }
    public String getValue() { return value; }
    public String getDescription() { return description; }
}
