package com.blog.shared.util;

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
 * 提供 JSON 序列化和反序列化功能
 */
@Slf4j
public class JsonUtil {

    private static final Gson gson;
    private static final Gson prettyGson;

    static {
        GsonBuilder builder = new GsonBuilder();

        // 包含 null 值（对应 Jackson Include.ALWAYS）
        builder.serializeNulls();

        // Java 8 时间类型适配（ISO-8601）
        registerJavaTimeAdapters(builder);

        // 你原来是“忽略未知字段”：Gson 默认就是忽略 JSON 中多余字段
        // 允许空对象：Gson 默认可序列化空对象

        gson = builder.create();
        prettyGson = builder.setPrettyPrinting().create();
    }

    /**
     * 对象转 JSON 字符串
     */
    public static String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return gson.toJson(obj);
        } catch (Exception e) {
            log.error("JSON序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON序列化失败", e);
        }
    }

    /**
     * 对象转美化的 JSON 字符串
     */
    public static String toPrettyJson(Object obj) {
        if (obj == null) return null;
        try {
            return prettyGson.toJson(obj);
        } catch (Exception e) {
            log.error("JSON序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON序列化失败", e);
        }
    }

    /**
     * JSON 字符串转对象
     */
    public static <T> T fromJson(String json, Class<T> clazz) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return gson.fromJson(json, clazz);
        } catch (JsonSyntaxException e) {
            log.error("JSON反序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化失败", e);
        }
    }

    /**
     * JSON 字符串转对象（支持泛型）
     * 用法：JsonUtil.fromJson(json, new TypeToken<List<Foo>>(){}.getType())
     */
    public static <T> T fromJson(String json, Type type) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return gson.fromJson(json, type);
        } catch (JsonSyntaxException e) {
            log.error("JSON反序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化失败", e);
        }
    }

    /**
     * JSON 字符串转 List
     */
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

    /**
     * JSON 字符串转 Map
     */
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

    /**
     * InputStream 转对象（默认 UTF-8）
     */
    public static <T> T fromInputStream(InputStream inputStream, Class<T> clazz) {
        if (inputStream == null) return null;
        try (Reader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8)) {
            return gson.fromJson(reader, clazz);
        } catch (IOException | JsonSyntaxException e) {
            log.error("从InputStream反序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("从InputStream反序列化失败", e);
        }
    }

    /**
     * 对象转换（通过 JSON 中转）
     */
    public static <T> T convertValue(Object obj, Class<T> clazz) {
        if (obj == null) return null;
        try {
            return gson.fromJson(gson.toJson(obj), clazz);
        } catch (Exception e) {
            log.error("对象转换失败: {}", e.getMessage(), e);
            throw new RuntimeException("对象转换失败", e);
        }
    }

    /**
     * 对象转换（支持泛型）
     */
    public static <T> T convertValue(Object obj, Type type) {
        if (obj == null) return null;
        try {
            return gson.fromJson(gson.toJson(obj), type);
        } catch (Exception e) {
            log.error("对象转换失败: {}", e.getMessage(), e);
            throw new RuntimeException("对象转换失败", e);
        }
    }

    /**
     * JSON 字符串转 JsonElement（类似 Jackson 的 JsonNode）
     */
    public static JsonElement parseJson(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return JsonParser.parseString(json);
        } catch (JsonSyntaxException e) {
            log.error("JSON解析失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON解析失败", e);
        }
    }

    /**
     * 验证 JSON 字符串是否有效
     */
    public static boolean isValidJson(String json) {
        if (json == null || json.trim().isEmpty()) return false;
        try {
            JsonParser.parseString(json);
            return true;
        } catch (JsonSyntaxException e) {
            return false;
        }
    }

    /**
     * 获取 Gson 实例
     */
    public static Gson getGson() {
        return gson;
    }

    /**
     * 创建新的 Gson 实例（用于特殊配置）
     */
    public static Gson createGson() {
        GsonBuilder builder = new GsonBuilder().serializeNulls();
        registerJavaTimeAdapters(builder);
        return builder.create();
    }

    // ------------------------- Java Time Adapters -------------------------

    private static void registerJavaTimeAdapters(GsonBuilder builder) {
        builder.registerTypeAdapter(LocalDate.class, new LocalDateAdapter());
        builder.registerTypeAdapter(LocalTime.class, new LocalTimeAdapter());
        builder.registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter());
        builder.registerTypeAdapter(Instant.class, new InstantAdapter());
        builder.registerTypeAdapter(OffsetDateTime.class, new OffsetDateTimeAdapter());
        builder.registerTypeAdapter(ZonedDateTime.class, new ZonedDateTimeAdapter());
    }

    private static class LocalDateAdapter implements JsonSerializer<LocalDate>, JsonDeserializer<LocalDate> {
        @Override public JsonElement serialize(LocalDate src, Type typeOfSrc, JsonSerializationContext context) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE));
        }
        @Override public LocalDate deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) {
            if (json == null || json.isJsonNull()) return null;
            return LocalDate.parse(json.getAsString(), DateTimeFormatter.ISO_LOCAL_DATE);
        }
    }

    private static class LocalTimeAdapter implements JsonSerializer<LocalTime>, JsonDeserializer<LocalTime> {
        @Override public JsonElement serialize(LocalTime src, Type typeOfSrc, JsonSerializationContext context) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_TIME));
        }
        @Override public LocalTime deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) {
            if (json == null || json.isJsonNull()) return null;
            return LocalTime.parse(json.getAsString(), DateTimeFormatter.ISO_LOCAL_TIME);
        }
    }

    private static class LocalDateTimeAdapter implements JsonSerializer<LocalDateTime>, JsonDeserializer<LocalDateTime> {
        @Override public JsonElement serialize(LocalDateTime src, Type typeOfSrc, JsonSerializationContext context) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        @Override public LocalDateTime deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) {
            if (json == null || json.isJsonNull()) return null;
            return LocalDateTime.parse(json.getAsString(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
    }

    private static class InstantAdapter implements JsonSerializer<Instant>, JsonDeserializer<Instant> {
        @Override public JsonElement serialize(Instant src, Type typeOfSrc, JsonSerializationContext context) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.toString()); // ISO-8601
        }
        @Override public Instant deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) {
            if (json == null || json.isJsonNull()) return null;
            return Instant.parse(json.getAsString());
        }
    }

    private static class OffsetDateTimeAdapter implements JsonSerializer<OffsetDateTime>, JsonDeserializer<OffsetDateTime> {
        @Override public JsonElement serialize(OffsetDateTime src, Type typeOfSrc, JsonSerializationContext context) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        }
        @Override public OffsetDateTime deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) {
            if (json == null || json.isJsonNull()) return null;
            return OffsetDateTime.parse(json.getAsString(), DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        }
    }

    private static class ZonedDateTimeAdapter implements JsonSerializer<ZonedDateTime>, JsonDeserializer<ZonedDateTime> {
        @Override public JsonElement serialize(ZonedDateTime src, Type typeOfSrc, JsonSerializationContext context) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_ZONED_DATE_TIME));
        }
        @Override public ZonedDateTime deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) {
            if (json == null || json.isJsonNull()) return null;
            return ZonedDateTime.parse(json.getAsString(), DateTimeFormatter.ISO_ZONED_DATE_TIME);
        }
    }
}
