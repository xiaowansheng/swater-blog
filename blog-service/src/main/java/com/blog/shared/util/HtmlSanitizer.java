package com.blog.shared.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

/**
 * HTML 清洗工具：基于 jsoup 的白名单过滤，用于在富文本入库前去除 XSS 载荷。
 *
 * <p>设计取舍：保留 {@link Safelist#relaxed()} 的富文本能力（图文、表格、列表、代码块等），
 * 同时额外放行 {@code class} 与 {@code style} 属性——富文本编辑器（Vditor/WangEditor）的
 * 代码高亮、对齐等渲染依赖这两个属性。事件处理属性（onclick 等）、危险标签
 * （script/iframe/object 等）会被 jsoup 自动剥离。</p>
 *
 * <p>此清洗在「写入时」执行一次，库内即安全；前端渲染端不再重复清洗，
 * 从而避免把重量级的 jsdom 引入前端 server bundle（曾导致 Next.js 预渲染 ENOENT）。</p>
 */
public final class HtmlSanitizer {

    private HtmlSanitizer() {
    }

    /** relaxed 白名单 + class/style，复用单例避免重复构造。 */
    private static final Safelist RICH_TEXT = Safelist.relaxed()
            .addAttributes(":all", "class")
            .addAttributes(":all", "style");

    /**
     * 清洗富文本 HTML：移除危险标签与事件属性，保留正文所需标签/样式。
     *
     * @param html 原始 HTML，null/空原样返回
     * @return 清洗后的安全 HTML
     */
    public static String cleanRichText(String html) {
        if (html == null || html.isEmpty()) {
            return html;
        }
        return Jsoup.clean(html, RICH_TEXT);
    }

    /**
     * 清洗纯文本输入（评论、留言等纯文本框 UGC）：移除全部 HTML 标签，仅保留文本内容。
     * <p>与 {@link #cleanRichText} 不同，这里不走白名单转义，而是直接剥掉标签——
     * 前端以纯文本插值渲染此类内容，保留实体会出现 "&amp;lt;" 之类的显示残留。
     * 入库即剥离，避免 XSS 防线完全押在前端渲染方式上。</p>
     *
     * @param text 原始文本，null/空原样返回
     * @return 不含任何 HTML 标签的文本
     */
    public static String cleanPlainText(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        return Jsoup.parse(text).text();
    }
}
