import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createListing = async (req, res, next) => {
  try {
    const listingData = req.body;
    
    // If agentRef is provided, validate that the agent exists
    if (listingData.agentRef) {
      const Agent = (await import('../models/agent.model.js')).default;
      const agent = await Agent.findById(listingData.agentRef);
      if (!agent) {
        return next(errorHandler(404, 'Agent not found!'));
      }
      
      // Update agent's listings count
      await Agent.findByIdAndUpdate(
        listingData.agentRef,
        { $inc: { listings: 1 } },
        { new: true }
      );
    }
    
    const listing = await Listing.create(listingData);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, 'You can only delete your own listings!'));
    }

    // If listing has an agent reference, decrement agent's listings count
    if (listing.agentRef) {
      const Agent = (await import('../models/agent.model.js')).default;
      await Agent.findByIdAndUpdate(
        listing.agentRef,
        { $inc: { listings: -1 } },
        { new: true }
      );
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Listing has been deleted!' });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

    const searchTerm = req.query.searchTerm || '';

    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getListingsByAgent = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const { limit = 10, startIndex = 0 } = req.query;
    
    // Validate agent exists
    const Agent = (await import('../models/agent.model.js')).default;
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return next(errorHandler(404, 'Agent not found!'));
    }
    
    const listings = await Listing.find({ agentRef: agentId })
      .limit(parseInt(limit))
      .skip(parseInt(startIndex))
      .sort({ createdAt: -1 });
    
    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const addHouseOptions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { houseOptions } = req.body;
    
    if (!houseOptions || !Array.isArray(houseOptions)) {
      return next(errorHandler(400, 'House options must be provided as an array'));
    }
    
    const listing = await Listing.findById(id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    
    // Check if user owns the listing or is the associated agent
    if (req.user.id !== listing.userRef && req.user.id !== listing.agentRef) {
      return next(errorHandler(401, 'You can only add options to your own listings!'));
    }
    
    // Add new house options (avoid duplicates)
    const updatedOptions = [...new Set([...listing.houseOptions, ...houseOptions])];
    
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { houseOptions: updatedOptions },
      { new: true }
    );
    
    return res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const removeHouseOption = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { option } = req.body;
    
    if (!option) {
      return next(errorHandler(400, 'Option to remove must be provided'));
    }
    
    const listing = await Listing.findById(id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    
    // Check if user owns the listing or is the associated agent
    if (req.user.id !== listing.userRef && req.user.id !== listing.agentRef) {
      return next(errorHandler(401, 'You can only remove options from your own listings!'));
    }
    
    // Remove the specified option
    const updatedOptions = listing.houseOptions.filter(opt => opt !== option);
    
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { houseOptions: updatedOptions },
      { new: true }
    );
    
    return res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};
