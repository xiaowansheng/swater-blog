package com.blog.plugin.core;


import org.springframework.util.StringUtils;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 通用插件选择器：支持单选、带降级和多播模式。
 */
public final class PluginSelector {

    private static final Comparator<Plugin> PRIORITY_ORDER = Comparator
            .comparingInt(Plugin::getPriority)
            .reversed()
            .thenComparing(Plugin::getName, Comparator.nullsLast(String::compareToIgnoreCase));

    private PluginSelector() {
    }

    /**
     * 单选插件，支持 active/fallback 配置，最终返回可用的第一个插件。
     */
    public static <T extends Plugin> T selectSingle(List<T> candidates, String activeId, String fallbackId) {
        List<T> enabled = enabledPlugins(candidates);

        T active = findById(enabled, activeId);
        if (active != null) {
            return active;
        }

        T fallback = findById(enabled, fallbackId);
        if (fallback != null) {
            return fallback;
        }

        return enabled.isEmpty() ? null : enabled.getFirst();
    }

    /**
     * 多播插件，根据配置的 enabled 列表决定启用哪些插件；不指定则启用全部可用插件。
     */
    public static <T extends Plugin> List<T> selectBroadcast(List<T> candidates, List<String> enabledIds) {
        List<T> enabled = enabledPlugins(candidates);
        if (enabled.isEmpty()) {
            return enabled;
        }

        if (enabledIds == null || enabledIds.isEmpty()) {
            return enabled;
        }

        Map<String, Integer> order = orderMap(enabledIds);
        return enabled.stream()
                .filter(p -> order.containsKey(p.getId()))
                .sorted(Comparator.comparingInt((Plugin p) -> order.get(p.getId()))
                        .thenComparing(PRIORITY_ORDER))
                .collect(Collectors.toList());
    }

    private static <T extends Plugin> List<T> enabledPlugins(List<T> candidates) {
        return candidates.stream()
                .filter(Plugin::isEnabled)
                .sorted(PRIORITY_ORDER)
                .toList();
    }

    private static <T extends Plugin> T findById(List<T> plugins, String id) {
        if (!StringUtils.hasText(id)) {
            return null;
        }
        String target = normalize(id);
        return plugins.stream()
                .filter(p -> target.equals(normalize(p.getId())))
                .findFirst()
                .orElse(null);
    }

    private static Map<String, Integer> orderMap(List<String> ids) {
        return ids.stream()
                .map(PluginSelector::normalize)
                .filter(StringUtils::hasText)
                .collect(Collectors.toMap(Function.identity(), ids::indexOf, Math::min));
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
