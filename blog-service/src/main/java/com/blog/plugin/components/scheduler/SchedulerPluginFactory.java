package com.blog.plugin.components.scheduler;


import com.blog.plugin.core.Plugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SchedulerPluginFactory {

    @Autowired
    private List<SchedulerPlugin> schedulerPlugins;

    public List<SchedulerPlugin> getPlugins() {
        return schedulerPlugins;
    }

    public SchedulerPlugin getActivePlugin() {
        List<SchedulerPlugin> plugins = getPlugins();
        if (plugins.isEmpty()) {
            throw new IllegalStateException("No active scheduler plugin found. Please configure plugin.scheduler.active property.");
        }
        if (plugins.size() > 1) {
            throw new IllegalStateException("Multiple scheduler plugins are active: " +
                    plugins.stream().map(Plugin::getName)
                            .collect(Collectors.joining(", ")) +
                    ". Only one should be active.");
        }
        return plugins.get(0);
    }
}
