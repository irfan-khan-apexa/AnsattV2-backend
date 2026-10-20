import { Request, Response } from "express";
import { Site } from "../../models/index";

const getCompanyCode = (req: Request): string | undefined => {
  return req.user?.companyCode;
};

/**
 * Create site
 */
const createSite = async (req: Request, res: Response) => {
  try {
    const company_code = getCompanyCode(req);

    if (!company_code) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, location, sitecode, latitude, longitude, radius } = req.body;

    if (
      !name?.trim() ||
      !location?.trim() ||
      !sitecode?.trim() ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message:
          "name, location, sitecode, latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const siteRadius = radius === undefined ? 100 : Number(radius);

    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    if (!Number.isFinite(siteRadius) || siteRadius <= 0) {
      return res.status(400).json({
        message: "radius must be a positive number",
      });
    }

    const normalizedSiteCode = sitecode.trim();

    const existing = await Site.findOne({
      where: {
        sitecode: normalizedSiteCode,
        company_code,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "Site already exists for this company",
      });
    }

    const site = await Site.create({
      name: name.trim(),
      location: location.trim(),
      sitecode: normalizedSiteCode,
      company_code,
      latitude: lat,
      longitude: lng,
      radius: siteRadius,
    });

    return res.status(201).json({
      message: "Site created successfully",
      site,
    });
  } catch (error: unknown) {
    console.error("createSite error:", error);

    return res.status(500).json({
      message: "Failed to create site",
    });
  }
};

/**
 * Get all sites belonging to the logged-in company
 */
const getAllSites = async (req: Request, res: Response) => {
  try {
    const company_code = getCompanyCode(req);

    if (!company_code) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sites = await Site.findAll({
      where: { company_code },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Sites fetched successfully",
      sites,
    });
  } catch (error: unknown) {
    console.error("getAllSites error:", error);

    return res.status(500).json({
      message: "Failed to fetch sites",
    });
  }
};

/**
 * Get a single site belonging to the logged-in company
 */
const getSiteById = async (req: Request, res: Response) => {
  try {
    const company_code = getCompanyCode(req);

    if (!company_code) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const siteId = Number(req.params.id);

    if (!Number.isInteger(siteId) || siteId <= 0) {
      return res.status(400).json({ message: "Invalid site ID" });
    }

    const site = await Site.findOne({
      where: {
        id: siteId,
        company_code,
      },
    });

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    return res.status(200).json(site);
  } catch (error: unknown) {
    console.error("getSiteById error:", error);

    return res.status(500).json({
      message: "Failed to fetch site",
    });
  }
};

/**
 * Update a site without allowing sitecode/company_code changes
 */
const updateSite = async (req: Request, res: Response) => {
  try {
    const company_code = getCompanyCode(req);

    if (!company_code) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const siteId = Number(req.params.id);

    if (!Number.isInteger(siteId) || siteId <= 0) {
      return res.status(400).json({ message: "Invalid site ID" });
    }

    const site = await Site.findOne({
      where: {
        id: siteId,
        company_code,
      },
    });

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const { name, location, latitude, longitude, radius } = req.body;

    const updates: {
      name?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
      radius?: number;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "Invalid site name" });
      }
      updates.name = name.trim();
    }

    if (location !== undefined) {
      if (typeof location !== "string" || !location.trim()) {
        return res.status(400).json({ message: "Invalid location" });
      }
      updates.location = location.trim();
    }

    if (latitude !== undefined) {
      const lat = Number(latitude);

      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({ message: "Invalid latitude" });
      }

      updates.latitude = lat;
    }

    if (longitude !== undefined) {
      const lng = Number(longitude);

      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        return res.status(400).json({ message: "Invalid longitude" });
      }

      updates.longitude = lng;
    }

    if (radius !== undefined) {
      const siteRadius = Number(radius);

      if (!Number.isFinite(siteRadius) || siteRadius <= 0) {
        return res.status(400).json({
          message: "radius must be a positive number",
        });
      }

      updates.radius = siteRadius;
    }

    await site.update(updates);

    return res.status(200).json({
      message: "Site updated successfully",
      site,
    });
  } catch (error: unknown) {
    console.error("updateSite error:", error);

    return res.status(500).json({
      message: "Failed to update site",
    });
  }
};

/**
 * Delete a site belonging to the logged-in company
 */
const deleteSite = async (req: Request, res: Response) => {
  try {
    const company_code = getCompanyCode(req);

    if (!company_code) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const siteId = Number(req.params.id);

    if (!Number.isInteger(siteId) || siteId <= 0) {
      return res.status(400).json({ message: "Invalid site ID" });
    }

    const site = await Site.findOne({
      where: {
        id: siteId,
        company_code,
      },
    });

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    await site.destroy();

    return res.status(200).json({
      message: "Site deleted successfully",
    });
  } catch (error: unknown) {
    console.error("deleteSite error:", error);

    return res.status(500).json({
      message: "Failed to delete site",
    });
  }
};

export { createSite, getAllSites, getSiteById, updateSite, deleteSite };
