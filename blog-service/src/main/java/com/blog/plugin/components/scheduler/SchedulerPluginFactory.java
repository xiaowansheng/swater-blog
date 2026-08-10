package com.blog.plugin.components.scheduler;


import com.blog.plugin.core.AbstractSinglePluginFactory;
import com.blog.plugin.core.Plugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SchedulerPluginFactory extends AbstractSinglePluginFactory<SchedulerPlugin> {

    @Autowired
    private List<SchedulerPlugin> schedulerPlugins;

    @Override
    public List<SchedulerPlugin> getPlugins() {
        return schedulerPlugins.stream()
                .filter(Plugin::isEnabled)
                .collect(Collectors.toList());
    }

    @Override
    protected String getPluginTypeName() {
        return "scheduler";
    }

    @Override
    protected String getConfigPropertyKey() {
        return "plugin.scheduler.active";
    }
}
