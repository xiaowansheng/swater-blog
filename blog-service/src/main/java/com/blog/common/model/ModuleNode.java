package com.blog.common.model;

import lombok.Data;
import java.util.List;

/**
 * 模块节点模型
 */
@Data
public class ModuleNode {
    private String apiKey;
    private String name;
    private String description;
    private String path;
    private String method;
    private Integer isOpen;
    private String perms;
    private String version;
    private List<ApiNode> apis;
    
    // Manual setter methods (Lombok backup)
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setPath(String path) { this.path = path; }
    public void setMethod(String method) { this.method = method; }
    public void setIsOpen(Integer isOpen) { this.isOpen = isOpen; }
    public void setPerms(String perms) { this.perms = perms; }
    public void setVersion(String version) { this.version = version; }
    public void setApis(List<ApiNode> apis) { this.apis = apis; }
    
    // Manual getter methods (Lombok backup)
    public String getApiKey() { return apiKey; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getPath() { return path; }
    public String getMethod() { return method; }
    public Integer getIsOpen() { return isOpen; }
    public String getPerms() { return perms; }
    public String getVersion() { return version; }
    public List<ApiNode> getApis() { return apis; }
}
