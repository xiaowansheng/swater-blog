package com.blog.shared.util.adapter;


import com.google.gson.*;

import java.lang.reflect.Type;
import java.time.*;
import java.time.format.DateTimeFormatter;
/**
 * description:  Java 8 time 类型适配器（ISO-8601）
 *
 * @author xiaowansheng
 * @since 2026/1/15 14:57
 */


public final class JavaTimeAdapters {

    private JavaTimeAdapters() {}

    public static void register(GsonBuilder builder) {
        builder.registerTypeAdapter(LocalDate.class, new LocalDateAdapter());
        builder.registerTypeAdapter(LocalTime.class, new LocalTimeAdapter());
        builder.registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter());
        builder.registerTypeAdapter(Instant.class, new InstantAdapter());
        builder.registerTypeAdapter(OffsetDateTime.class, new OffsetDateTimeAdapter());
        builder.registerTypeAdapter(ZonedDateTime.class, new ZonedDateTimeAdapter());
    }

    static final class LocalDateAdapter implements JsonSerializer<LocalDate>, JsonDeserializer<LocalDate> {
        @Override public JsonElement serialize(LocalDate src, Type t, JsonSerializationContext c) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE));
        }
        @Override public LocalDate deserialize(JsonElement json, Type t, JsonDeserializationContext c) {
            if (json == null || json.isJsonNull()) return null;
            return LocalDate.parse(json.getAsString(), DateTimeFormatter.ISO_LOCAL_DATE);
        }
    }

    static final class LocalTimeAdapter implements JsonSerializer<LocalTime>, JsonDeserializer<LocalTime> {
        @Override public JsonElement serialize(LocalTime src, Type t, JsonSerializationContext c) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_TIME));
        }
        @Override public LocalTime deserialize(JsonElement json, Type t, JsonDeserializationContext c) {
            if (json == null || json.isJsonNull()) return null;
            return LocalTime.parse(json.getAsString(), DateTimeFormatter.ISO_LOCAL_TIME);
        }
    }

    static final class LocalDateTimeAdapter implements JsonSerializer<LocalDateTime>, JsonDeserializer<LocalDateTime> {
        @Override public JsonElement serialize(LocalDateTime src, Type t, JsonSerializationContext c) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        @Override public LocalDateTime deserialize(JsonElement json, Type t, JsonDeserializationContext c) {
            if (json == null || json.isJsonNull()) return null;
            return LocalDateTime.parse(json.getAsString(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
    }

    static final class InstantAdapter implements JsonSerializer<Instant>, JsonDeserializer<Instant> {
        @Override public JsonElement serialize(Instant src, Type t, JsonSerializationContext c) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.toString());
        }
        @Override public Instant deserialize(JsonElement json, Type t, JsonDeserializationContext c) {
            if (json == null || json.isJsonNull()) return null;
            return Instant.parse(json.getAsString());
        }
    }

    static final class OffsetDateTimeAdapter implements JsonSerializer<OffsetDateTime>, JsonDeserializer<OffsetDateTime> {
        @Override public JsonElement serialize(OffsetDateTime src, Type t, JsonSerializationContext c) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        }
        @Override public OffsetDateTime deserialize(JsonElement json, Type t, JsonDeserializationContext c) {
            if (json == null || json.isJsonNull()) return null;
            return OffsetDateTime.parse(json.getAsString(), DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        }
    }

    static final class ZonedDateTimeAdapter implements JsonSerializer<ZonedDateTime>, JsonDeserializer<ZonedDateTime> {
        @Override public JsonElement serialize(ZonedDateTime src, Type t, JsonSerializationContext c) {
            return src == null ? JsonNull.INSTANCE : new JsonPrimitive(src.format(DateTimeFormatter.ISO_ZONED_DATE_TIME));
        }
        @Override public ZonedDateTime deserialize(JsonElement json, Type t, JsonDeserializationContext c) {
            if (json == null || json.isJsonNull()) return null;
            return ZonedDateTime.parse(json.getAsString(), DateTimeFormatter.ISO_ZONED_DATE_TIME);
        }
    }
}
