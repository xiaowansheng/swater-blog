package com.blog.plugin.components.scheduler;


import com.blog.plugin.components.scheduler.config.SchedulerPluginProperties;
import com.blog.plugin.core.PluginSelector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SchedulerPluginFactory {
    
    @Autowired
    private List<SchedulerPlugin> schedulerPlugins;

    @Autowired
    private SchedulerPluginProperties schedulerPluginProperties;
    
    public List<SchedulerPlugin> getPlugins() {
        return schedulerPlugins.stream()
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .collect(Collectors.toList());
    }

    public SchedulerPlugin getActivePlugin() {
        List<SchedulerPlugin> enabled = getPlugins();
        return PluginSelector.selectSingle(
                enabled,
                schedulerPluginProperties.getActive(),
                schedulerPluginProperties.getFallback()
        );
    }
}

