package com.blog.common.model;

import lombok.Data;

/**
 * API节点模型
 */
@Data
public class ApiNode {
    private Long id;
    private String apiKey;
    private String name;
    private String path;
    private String method;
    private String description;
    private Integer isOpen;
    private String perms;
    private String type;
    private String version;
    private Boolean logOperation;
    private Boolean logException;
    
    // Manual setter methods (Lombok backup)
    public void setId(Long id) { this.id = id; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public void setName(String name) { this.name = name; }
    public void setPath(String path) { this.path = path; }
    public void setMethod(String method) { this.method = method; }
    public void setDescription(String description) { this.description = description; }
    public void setIsOpen(Integer isOpen) { this.isOpen = isOpen; }
    public void setPerms(String perms) { this.perms = perms; }
    public void setType(String type) { this.type = type; }
    public void setVersion(String version) { this.version = version; }
    public void setLogOperation(Boolean logOperation) { this.logOperation = logOperation; }
    public void setLogException(Boolean logException) { this.logException = logException; }
    
    // Manual getter methods (Lombok backup)
    public Long getId() { return id; }
    public String getApiKey() { return apiKey; }
    public String getName() { return name; }
    public String getPath() { return path; }
    public String getMethod() { return method; }
    public String getDescription() { return description; }
    public Integer getIsOpen() { return isOpen; }
    public String getPerms() { return perms; }
    public String getType() { return type; }
    public String getVersion() { return version; }
    public Boolean getLogOperation() { return logOperation; }
    public Boolean getLogException() { return logException; }
}
