package com.rental.service;

import com.rental.daos.PropertyDao;
import com.rental.dto.ChatRequestDto;
import com.rental.dto.ChatResponseDto;
import com.rental.entity.Property;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiChatService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Autowired
    private PropertyDao propertyDao;

    private final RestTemplate restTemplate = new RestTemplate();

    public ChatResponseDto getAiReply(ChatRequestDto requestDto) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("YOUR_")) {
            return new ChatResponseDto("AI key is unconfigured. Please add a valid API key in application.properties.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey.trim());

        // 1. Retrieve active property listings safely from MySQL
        List<Property> activeProperties = propertyDao.findAll();

        StringBuilder propertyListContext = new StringBuilder();
        if (activeProperties != null && !activeProperties.isEmpty()) {
            propertyListContext.append("Currently Available Listings in RentEase Database:\n");
            for (Property p : activeProperties) {
                String title = p.getTitle() != null ? p.getTitle() : "Rental Property";
                String city = p.getCity() != null ? p.getCity() : "Unspecified";
                String price = p.getPrice() != null ? p.getPrice().toString() : "N/A";
                String type = p.getPropertyType() != null ? p.getPropertyType().toString() : "General";
                String desc = p.getDescription() != null ? p.getDescription() : "No description provided";

                propertyListContext.append(String.format(
                    "- Property ID #%d: '%s' in %s | Rent: ₹%s/month | Type: %s | Description: %s\n",
                    p.getPropertyId(), title, city, price, type, desc
                ));
            }
        } else {
            propertyListContext.append("Currently, there are no active properties listed in the database.\n");
        }

        // 2. Build system instruction prompt with database context
        String systemInstruction = 
            "You are RentEase Assistant, the official AI concierge for the RentEase Property Rental System.\n\n" +
            "Guidelines:\n" +
            "1. Answer tenant queries accurately using these live database listings:\n" + 
            propertyListContext.toString() + "\n" +
            "2. Match recommendations strictly by city or budget from the list above.\n" +
            "3. Help tenants understand the booking flow (Pending -> Approved -> Paid).\n" +
            "4. Keep responses under 3-4 sentences, polite, and clear.\n" +
            "5. Do NOT make up fake property listings.";

        Map<String, Object> systemMessage = Map.of(
            "role", "system",
            "content", systemInstruction
        );

        Map<String, Object> userMessage = Map.of(
            "role", "user",
            "content", (requestDto.getMessage() != null && !requestDto.getMessage().trim().isEmpty()) 
                        ? requestDto.getMessage().trim() : "Hello"
        );

        // Dynamically select model based on provider URL (Groq vs OpenAI)
        String modelName = apiUrl.contains("groq.com") ? "llama-3.3-70b-versatile" : "gpt-3.5-turbo";

        Map<String, Object> requestBody = Map.of(
            "model", modelName,
            "messages", List.of(systemMessage, userMessage),
            "max_tokens", 250,
            "temperature", 0.3
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            if (response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    if (message != null && message.get("content") != null) {
                        return new ChatResponseDto(((String) message.get("content")).trim());
                    }
                }
            }
            return new ChatResponseDto("Received an empty response from the AI engine.");
        } catch (HttpClientErrorException.Unauthorized e) {
            System.err.println("API Key Authentication Failed (401): Check your API key in application.properties.");
            return new ChatResponseDto("Authentication failed for the AI provider. Please verify your API key in application.properties.");
        } catch (Exception e) {
            e.printStackTrace();
            return new ChatResponseDto("Unable to process AI chat request right now. Please check server logs.");
        }
    }
}