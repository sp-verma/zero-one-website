"use server";

import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resouces";

export async function addResource(formData) {
  try {
    await dbConnect();
    const { domain, description, image, topics } = formData;
    if (!domain) {
      return { success: false, message: "Domain is required", type: "error" };
    }
    const existingResources = await Resource.findOne({ domain });
    if (existingResources) {
      return { success: false, message: "Resource already exists", type: "error" };
    }
    const newResource = new Resource({ domain, description, image, topics });
    await newResource.save();
    return { success: true, message: "Added Successfully", type: "success", newResource };
  } catch (error) {
    console.error("Error adding resource:", error);
    return { success: false, message: error.message || "Internal server error", type: "error" };
  }
}

export async function getResources() {
  try {
    await dbConnect();
    const resources = await Resource.find({});
    return { success: true, data: resources };
  } catch (error) {
    console.error("Error fetching resources:", error);
    return { success: false, message: error.message || "Internal server error", type: "error" };
  }
}

export async function addTopics(topicdata) {
  try {
    await dbConnect();
    const { domain, title, description, image, subtopics } = topicdata;
    if (!title || !domain) {
      return { success: false, message: "Title and domain are required", type: "error" };
    }
    const existingDomain = await Resource.findOne({ domain: { $regex: new RegExp("^" + domain + "$", "i") } }, { topics: 1 });
    if (!existingDomain) {
      return { success: false, message: `Domain "${domain}" not found. Please add the domain first.`, type: "error" };
    }
    if (!existingDomain.topics) {
      existingDomain.topics = [];
    }
    const titleExists = existingDomain.topics.some((topic) => topic.title === title);
    if (titleExists) {
      return { success: false, message: "Title already exists, please add a new title", type: "error" };
    }
    existingDomain.topics.push({ title, description, image, subtopics });
    await existingDomain.save();
    return { success: true, message: "Topic added successfully", type: "success" };
  } catch (error) {
    console.error("Error adding topic:", error);
    return { success: false, message: error.message || "Internal server error", type: "error" };
  }
}

export async function getTopics(domain) {
  try {
    await dbConnect();
    const topics = await Resource.findOne(
      { domain: { $regex: new RegExp("^" + domain + "$", "i") } },
      { topics: 1 }
    );
    if (!topics) {
      return { success: false, message: `No topics found for domain "${domain}"`, type: "error" };
    }
    return { success: true, data: topics.topics };
  } catch (error) {
    console.error("Error fetching topics:", error);
    return { success: false, message: error.message || "Internal server error", type: "error" };
  }
}

export async function addSubtopic(subtopicdata) {
  try {
    await dbConnect();
    const { domain, topic, title, description, image, resourceUrl } = subtopicdata;
    if (!domain || !topic || !title || !resourceUrl) {
      return { success: false, message: "Domain, topic, title, and resource URL are required", type: "error" };
    }
    const existDomain = await Resource.findOne(
      { domain: { $regex: new RegExp("^" + domain + "$", "i") }, "topics.title": { $regex: new RegExp("^" + topic + "$", "i") } },
      { "topics.$": 1 }
    );
    if (!existDomain) {
      return { success: false, message: `Topic "${topic}" not found. Please add the topic first.`, type: "error" };
    }
    const topicData = existDomain.topics[0];
    if (topicData.subtopics.some((subtopic) => subtopic.title === title)) {
      return { success: false, message: "Subtopic already exists, please add a new subtopic", type: "error" };
    }
    const result = await Resource.updateOne(
      { domain: { $regex: new RegExp("^" + domain + "$", "i") }, "topics.title": { $regex: new RegExp("^" + topic + "$", "i") } },
      { $push: { "topics.$.subtopics": { title, description, image, resourceUrl } } }
    );
    if (result.modifiedCount === 0) {
      return { success: false, message: "Subtopic addition failed. Topic may not exist.", type: "error" };
    }
    return { success: true, message: "Subtopic added successfully", type: "success" };
  } catch (error) {
    console.error("Error adding subtopic:", error);
    return { success: false, message: error.message || "Internal server error", type: "error" };
  }
}

export async function getSubtopics(domain, topic) {
  try {
    await dbConnect();
    const resource = await Resource.findOne(
      { domain: { $regex: new RegExp("^" + domain + "$", "i") }, "topics.title": { $regex: new RegExp("^" + topic + "$", "i") } },
      { "topics.$": 1 }
    );
    if (!resource || !resource.topics.length) {
      return { success: false, message: `No subtopics found for topic "${topic}" in domain "${domain}"`, type: "error" };
    }
    return { success: true, data: resource.topics[0].subtopics };
  } catch (error) {
    console.error("Error fetching subtopics:", error);
    return { success: false, message: error.message || "Internal server error", type: "error" };
  }
}
