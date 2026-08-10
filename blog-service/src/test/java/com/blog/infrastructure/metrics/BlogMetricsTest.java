package com.blog.infrastructure.metrics;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BlogMetricsTest {

    @Test
    void recordsArticleLifecycleCountersAndTotalGauge() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        BlogMetrics metrics = new BlogMetrics(registry);

        metrics.incrementArticleUpdated("1", "original");
        metrics.incrementArticleDeleted();
        metrics.updateTotalArticles(12);

        assertThat(registry.get("blog.article.updated").counter().count()).isEqualTo(1);
        assertThat(registry.get("blog.article.deleted").counter().count()).isEqualTo(1);
        assertThat(registry.get("blog.articles.total").gauge().value()).isEqualTo(12);
    }
}
