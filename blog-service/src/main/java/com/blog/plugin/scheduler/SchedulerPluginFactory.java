package com.blog.plugin.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SchedulerPluginFactory {
    
    @Autowired
    private List<SchedulerPlugin> schedulerPlugins;
    
    public SchedulerPlugin getPlugin() {
        return schedulerPlugins.stream()
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .findFirst()
                .orElse(null);
    }
}

