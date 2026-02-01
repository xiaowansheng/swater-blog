package com.blog.infrastructure.revalidate;

import java.util.List;

public class RevalidateTags {

    public static final List<String> ARTICLE_LIST = List.of(
            "article:list",
            "article:latest",
            "article:hot"
    );

    public static final List<String> MOMENT_LIST = List.of("moment:list");
    public static final List<String> FRIENDLINK_LIST = List.of("friendlink:list");
    public static final List<String> ARCHIVE_LIST = List.of("archive:list");
    public static final List<String> SITE_CONFIG = List.of("site:config");

    private RevalidateTags() {}
}
