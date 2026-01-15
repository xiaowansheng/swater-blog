package com.blog.shared.util;

import com.blog.shared.util.adapter.JavaTimeAdapters;
import com.blog.shared.util.adapter.JdkTypeAdapters;
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import lombok.extern.slf4j.Slf4j;

import java.io.*;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * JSON 工具类（Gson 版）
 */
@Slf4j
public class JsonUtil {

    private static final Gson gson;
    private static final Gson prettyGson;

    static {
        GsonBuilder builder = new GsonBuilder();

        // 包含 null 值（对应 Jackson Include.ALWAYS）
        builder.serializeNulls();

        // 解决 JDK 强封装导致的反射不可访问：File/Path 等用字符串序列化
        JdkTypeAdapters.register(builder);

        // Java 8 时间类型适配（ISO-8601）
        JavaTimeAdapters.register(builder);

        gson = builder.create();
        prettyGson = builder.setPrettyPrinting().create();
    }

    /** 对象转 JSON 字符串 */
    public static String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return gson.toJson(obj);
        } catch (Exception e) {
            log.error("JSON序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON序列化失败", e);
        }
    }

    /** 对象转美化 JSON 字符串 */
    public static String toPrettyJson(Object obj) {
        if (obj == null) return null;
        try {
            return prettyGson.toJson(obj);
        } catch (Exception e) {
            log.error("JSON序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON序列化失败", e);
        }
    }

    /** JSON 字符串转对象 */
    public static <T> T fromJson(String json, Class<T> clazz) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return gson.fromJson(json, clazz);
        } catch (JsonSyntaxException e) {
            log.error("JSON反序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化失败", e);
        }
    }

    /** JSON 字符串转对象（支持泛型） */
    public static <T> T fromJson(String json, Type type) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return gson.fromJson(json, type);
        } catch (JsonSyntaxException e) {
            log.error("JSON反序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化失败", e);
        }
    }

    /** JSON 字符串转 List */
    public static <T> List<T> fromJsonToList(String json, Class<T> clazz) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            Type type = TypeToken.getParameterized(List.class, clazz).getType();
            return gson.fromJson(json, type);
        } catch (JsonSyntaxException e) {
            log.error("JSON反序列化为List失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化为List失败", e);
        }
    }

    /** JSON 字符串转 Map */
    public static Map<String, Object> fromJsonToMap(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            Type type = new TypeToken<Map<String, Object>>() {}.getType();
            return gson.fromJson(json, type);
        } catch (JsonSyntaxException e) {
            log.error("JSON反序列化为Map失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化为Map失败", e);
        }
    }

    /** InputStream 转对象（默认 UTF-8） */
    public static <T> T fromInputStream(InputStream inputStream, Class<T> clazz) {
        if (inputStream == null) return null;
        try (Reader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8)) {
            return gson.fromJson(reader, clazz);
        } catch (IOException | JsonSyntaxException e) {
            log.error("从InputStream反序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("从InputStream反序列化失败", e);
        }
    }

    /** 对象转换（通过 JSON 中转） */
    public static <T> T convertValue(Object obj, Class<T> clazz) {
        if (obj == null) return null;
        try {
            return gson.fromJson(gson.toJson(obj), clazz);
        } catch (Exception e) {
            log.error("对象转换失败: {}", e.getMessage(), e);
            throw new RuntimeException("对象转换失败", e);
        }
    }

    /** 对象转换（支持泛型） */
    public static <T> T convertValue(Object obj, Type type) {
        if (obj == null) return null;
        try {
            return gson.fromJson(gson.toJson(obj), type);
        } catch (Exception e) {
            log.error("对象转换失败: {}", e.getMessage(), e);
            throw new RuntimeException("对象转换失败", e);
        }
    }

    /** JSON 字符串转 JsonElement（类似 Jackson JsonNode） */
    public static JsonElement parseJson(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return JsonParser.parseString(json);
        } catch (JsonSyntaxException e) {
            log.error("JSON解析失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON解析失败", e);
        }
    }

    /** 验证 JSON 是否有效 */
    public static boolean isValidJson(String json) {
        if (json == null || json.trim().isEmpty()) return false;
        try {
            JsonParser.parseString(json);
            return true;
        } catch (JsonSyntaxException e) {
            return false;
        }
    }

    public static Gson getGson() {
        return gson;
    }

    /** 创建新的 Gson 实例（用于特殊配置） */
    public static Gson createGson() {
        GsonBuilder builder = new GsonBuilder().serializeNulls();
        JdkTypeAdapters.register(builder);
        JavaTimeAdapters.register(builder);
        return builder.create();
    }
}
