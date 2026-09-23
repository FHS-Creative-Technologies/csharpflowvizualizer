using System;
using System.Text.Json;
using System.Text.Json.Serialization;

public class BaseInfoJsonConverter : JsonConverter<BaseInfo>
{
    public override BaseInfo? Read(
        ref Utf8JsonReader reader,
        System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        throw new NotSupportedException(
            "Deserializing BaseInfo is not supported by this converter."
        );
    }

    public override void Write(Utf8JsonWriter writer, BaseInfo value, JsonSerializerOptions options)
    {
        if (value == null)
        {
            writer.WriteNullValue();
            return;
        }

        // Serialize using the runtime type so derived-type properties are included
        JsonSerializer.Serialize(writer, (object)value, value.GetType(), options);
    }
}
