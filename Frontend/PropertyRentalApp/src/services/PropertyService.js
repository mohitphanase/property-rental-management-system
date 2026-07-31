
import api from "./api";

// Add Property
export const addProperty = async (data) => {
  return await api.post("/owner/properties", data);
};

// Upload Property Image
export const uploadPropertyImage = async (propertyId, imageUri) => {
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: "property.jpg",
    type: "image/jpeg",
  });

  return await api.post(
    `/owner/properties/${propertyId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Get My Properties
export const getMyProperties = async () => {
  return await api.get("/owner/properties");
};

// Get Property By Id
export const getPropertyById = async (propertyId) => {
  return await api.get(`/owner/properties/${propertyId}`);
};

//editProperty by id
export const updateProperty = async (propertyId, data) =>
  api.put(`/owner/properties/${propertyId}`, data);

//deleteProperty by id
export const deleteProperty = async (propertyId) =>
  api.delete(`/owner/properties/${propertyId}`);