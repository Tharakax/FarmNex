import Crop from "../models/Crop.js";
import PDFDocument from "pdfkit";
// Create new crop plan
// Helper: sanitize payload to ensure numbers are numbers (strip units like "kg")
const sanitizeCropPayload = (body) => {
  const data = { ...(body || {}) };

  // areaSize.value -> Number
  if (data.areaSize) {
    const v = data.areaSize.value;
    data.areaSize = {
      ...data.areaSize,
      value: typeof v === 'number' ? v : (v ? parseFloat(String(v).replace(/[^0-9.\-]/g, '')) : 0),
    };
  }

  // fertilizers: ensure day and quantity are numbers
  if (Array.isArray(data.fertilizers)) {
    data.fertilizers = data.fertilizers.map((f) => {
      const day = f && f.day != null ? parseInt(String(f.day).replace(/[^0-9\-]/g, ''), 10) : 0;
      const rawQty = f && f.quantity != null ? String(f.quantity) : '';
      const qty = rawQty === '' ? 0 : parseFloat(rawQty.replace(/[^0-9.\-]/g, '')) || 0;
      return {
        ...f,
        day: Number.isNaN(day) ? 0 : day,
        quantity: qty,
      };
    });
  }

  // Duration / Litres_of_water passthrough (ensure strings)
  if (data.Duration != null && typeof data.Duration !== 'string') data.Duration = String(data.Duration);
  if (data.Litres_of_water != null && typeof data.Litres_of_water !== 'string') data.Litres_of_water = String(data.Litres_of_water);

  return data;
};

export const createCrop = async (req, res) => {
  try {
    const payload = sanitizeCropPayload(req.body);
    const crop = new Crop(payload);
    await crop.save();
    res.status(201).json({ success: true, message: "Crop Plan added successfully", data: crop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all crop plans
export const getAllCrops = async (req, res) => {
  try {
    const plans = await Crop.find();

    // Normalize documents for frontend
    const normalize = (doc) => {
      if (!doc) return doc;
      const a = doc.toObject ? doc.toObject() : { ...doc };

      // Ensure areaSize shape
      a.areaSize = a.areaSize || { value: null, unit: 'acres' };
      a.areaSize.value = a.areaSize.value ?? (a.areaSize.value === 0 ? 0 : a.areaSize.value);

      // Ensure fertilizers array
      if (!Array.isArray(a.fertilizers)) a.fertilizers = [];

      // Provide defaults for water/duration
      a.Litres_of_water = a.Litres_of_water || a.litres_of_water || null;
      a.Duration = a.Duration || null;

      return a;
    };

    const normalized = plans.map(normalize);
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get crop by ID
export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop Plan not found" });

    const a = crop.toObject ? crop.toObject() : { ...crop };
    a.areaSize = a.areaSize || { value: null, unit: 'acres' };
    if (!Array.isArray(a.fertilizers)) a.fertilizers = [];
    a.Litres_of_water = a.Litres_of_water || a.litres_of_water || null;

    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update crop plan
export const updateCrop = async (req, res) => {
  try {
    const payload = sanitizeCropPayload(req.body);
    const updated = await Crop.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Crop Plan not found" });
    res.json({ status: "Crop Plan updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete crop plan
export const deleteCrop = async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ status: "Crop Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//pdf

export const generateCropReport = async (req, res) => {
  try {
    const crops = await Crop.find();

    if (!crops || crops.length === 0) {
      return res.status(404).json({ message: "No crop data found" });
    }

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=crop_report.pdf");

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res); // pipe PDF to response

    // Title
    doc.fontSize(20).text("Crop Report", { align: "center" });
    doc.moveDown();

    crops.forEach((crop, index) => {
      doc.fontSize(14).text(`Crop Plan #${index + 1}`, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12).text(`Plan Name: ${crop.planName || "N/A"}`);
      doc.text(`Crop Type: ${crop.cropType || "N/A"}`);
      doc.text(`Variety: ${crop.variety || "N/A"}`);
      doc.text(`Planting Date: ${crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : "N/A"}`);
      doc.text(`Harvest Date: ${crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : "N/A"}`);
      doc.text(`Area: ${crop.areaSize?.value || "N/A"} ${crop.areaSize?.unit || ""}`);
      doc.text(`Soil Type: ${crop.soilType || "N/A"}`);
      doc.text(`Irrigation: ${crop.irrigationMethod || "N/A"}`);
      doc.text(`Water: ${crop.Litres_of_water || "N/A"}`);
      doc.text(`Duration: ${crop.Duration || "N/A"}`);

      if (crop.fertilizers && crop.fertilizers.length > 0) {
        doc.text("Fertilizer Schedule:");
        crop.fertilizers.forEach((f, i) => {
          doc.text(`   ${i + 1}. ${f.fertilizer || "N/A"} - Quantity: ${f.quantity || "N/A"}, Day: ${f.day || "N/A"}, Duration: ${f.duration || "-"}`);
        });
      }

      doc.moveDown(1.5);
    });

    doc.end(); // finalize PDF
  } catch (err) {
    console.error("Crop PDF generation error:", err);
    res.status(500).json({ message: "Error generating Crop PDF", error: err.message });
  }
};

