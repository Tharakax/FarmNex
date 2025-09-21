import Livestock from "../models/Livestock.js";
import PDFDocument from "pdfkit";

// Create new livestock plan
export const createLivestock = async (req, res) => {
  try {
    const livestock = new Livestock(req.body);
    await livestock.save();
    res.status(201).json({
      success: true,
      message: "Livestock Plan added successfully",
      data: livestock,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all livestock plans
export const getAllLivestock = async (req, res) => {
  try {
    const animals = await Livestock.find();

    // Normalize each document so frontend can rely on stable field names
    const normalize = (doc) => {
      if (!doc) return doc;
      const a = doc.toObject ? doc.toObject() : { ...doc };

      // weight: prefer top-level weight, then rearingDetails.weight
      a.weight = a.weight ?? (a.rearingDetails && a.rearingDetails.weight) ?? null;

      // feedings: prefer array, else convert feeding.feedingPlan string to an array
      if (Array.isArray(a.feedings) && a.feedings.length) {
        // already present
      } else if (a.feeding && a.feeding.feedingPlan) {
        a.feedings = [{ feedType: a.feeding.feedingPlan }];
      } else {
        a.feedings = a.feedings || [];
      }

      // healthRecords: prefer array, else convert health object to a single record
      if (Array.isArray(a.healthRecords) && a.healthRecords.length) {
        // ok
      } else if (a.health && (a.health.healthStatus || a.health.veterinarian)) {
        a.healthRecords = [{ date: null, treatment: a.health.healthStatus || null, vet: a.health.veterinarian || null }];
      } else {
        a.healthRecords = a.healthRecords || [];
      }

      // housing: prefer top-level
      a.housing = a.housing || "";

      // waterSupply helper
      a.waterSupply = (a.feeding && a.feeding.waterSupply) || a.waterSupply || null;

      // files: prefer uploads.certificates or files
      a.files = (a.uploads && a.uploads.certificates) ? a.uploads.certificates : (a.files || []);

      return a;
    };

    const normalized = animals.map(normalize);
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get livestock by ID
export const getLivestockById = async (req, res) => {
  try {
    const livestock = await Livestock.findById(req.params.id);
    if (!livestock) return res.status(404).json({ message: "Livestock not found" });

    // normalize before returning
    const a = livestock.toObject ? livestock.toObject() : { ...livestock };
    a.weight = a.weight ?? (a.rearingDetails && a.rearingDetails.weight) ?? null;
    if (!(Array.isArray(a.feedings) && a.feedings.length) && a.feeding && a.feeding.feedingPlan) {
      a.feedings = [{ feedType: a.feeding.feedingPlan }];
    }
    if (!(Array.isArray(a.healthRecords) && a.healthRecords.length) && a.health && (a.health.healthStatus || a.health.veterinarian)) {
      a.healthRecords = [{ date: null, treatment: a.health.healthStatus || null, vet: a.health.veterinarian || null }];
    }
    a.housing = a.housing || "";
    a.waterSupply = (a.feeding && a.feeding.waterSupply) || a.waterSupply || null;
    a.files = (a.uploads && a.uploads.certificates) ? a.uploads.certificates : (a.files || []);

    res.json(a);
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
};

// Update livestock plan
export const updateLivestock = async (req, res) => {
  try {
    const updated = await Livestock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Livestock Plan not found" });
    res.json({ status: "Livestock Plan updated successfully", data: updated });
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
};

// Delete livestock plan
export const deleteLivestock = async (req, res) => {
  try {
    await Livestock.findByIdAndDelete(req.params.id);
    res.json({ status: "Livestock Plan deleted successfully" });
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
};

//pdf
export const generateLivestockReport = async (req, res) => {
  try {
    const animals = await Livestock.find();

    if (!animals || animals.length === 0) {
      return res.status(404).json({ message: "No livestock data found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=livestock_report.pdf");

    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(res); // pipe to response

    doc.fontSize(20).text("Livestock Report", { align: "center" });
    doc.moveDown();

    animals.forEach((animal, index) => {
      doc.fontSize(14).text(`Animal #${index + 1}`, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12).text(`Plan Name: ${animal.planName || "N/A"}`);
      doc.text(`Type: ${animal.livestockType || "N/A"}`);
      doc.text(`Breed/Variety: ${animal.variety || "N/A"}`);
      doc.text(`Weight: ${animal.weight || (animal.rearingDetails?.weight ?? "N/A")}`);
      doc.text(`Housing: ${animal.housing || "N/A"}`);
      doc.text(`Water Supply: ${(animal.feeding?.waterSupply) || animal.waterSupply || "N/A"}`);

      if (animal.feedings && animal.feedings.length > 0) {
        doc.text("Feeding Plan:");
        animal.feedings.forEach((feed, i) => doc.text(`   ${i + 1}. ${feed.feedType || "N/A"}`));
      }

      if (animal.healthRecords && animal.healthRecords.length > 0) {
        doc.text("Health Records:");
        animal.healthRecords.forEach((rec, i) => {
          doc.text(`   ${i + 1}. Date: ${rec.date || "N/A"}, Treatment: ${rec.treatment || "N/A"}, Vet: ${rec.vet || "N/A"}`);
        });
      }

      if (animal.files && animal.files.length > 0) {
        doc.text("Certificates/Files:");
        animal.files.forEach((file, i) => doc.text(`   ${i + 1}. ${file}`));
      }

      doc.moveDown(1.5);
    });

    doc.end(); // finalize PDF
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Error generating PDF", error: err.message });
  }
};
