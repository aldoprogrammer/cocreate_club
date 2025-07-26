"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  price: number;
  options: { label: string; count: number; _id: string }[];
  creator: { _id: string; fullName: string };
  participants?: { user: string; hasPaid: boolean; _id: string }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function Campaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    images: string;
    category: string;
    price: string;
    options: string[];
  }>({
    title: "",
    description: "",
    images: "",
    category: "",
    price: "",
    options: ["", ""], // Minimum 2 options
  });
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [editOptions, setEditOptions] = useState<string[]>(["", ""]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = localStorage.getItem("token");
  const user: User | null = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    if (!token || !user) {
      toast.error("Please log in to view your campaigns");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter campaigns where creator._id matches user._id
      const userCampaigns = response.data.filter((campaign: Campaign) => {
        const isMatch = campaign.creator?._id === user._id;
        console.log(
          `Campaign ${campaign._id}: creator._id=${campaign.creator?._id}, user._id=${user._id}, match=${isMatch}`
        ); // Debug log
        return isMatch;
      });
      setCampaigns(userCampaigns);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const handleEditOptionChange = (index: number, value: string) => {
    const newOptions = [...editOptions];
    newOptions[index] = value;
    setEditOptions(newOptions);
  };

  const addEditOption = () => {
    setEditOptions([...editOptions, ""]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !user) {
      toast.error("Please log in to create a campaign");
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...formData,
        images: formData.images
          .split(",")
          .map((img) => img.trim())
          .filter((img) => img),
        price: parseFloat(formData.price),
        options: formData.options.filter((opt) => opt.trim() !== ""),
      };
      await axios.post(`${backendUrl}/campaigns`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Campaign created successfully!");
      setFormData({
        title: "",
        description: "",
        images: "",
        category: "",
        price: "",
        options: ["", ""],
      });
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editCampaign || !token || !user) {
      toast.error("Please log in and select a campaign to update");
      return;
    }
    setLoading(true);
    try {
      const data = {
        title: editCampaign.title,
        description: editCampaign.description,
        images: editCampaign.images,
        category: editCampaign.category,
        price: editCampaign.price,
      };
      await axios.patch(`${backendUrl}/campaigns/${editCampaign._id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Campaign updated successfully!");
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOptions = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editCampaign || !token || !user) {
      toast.error("Please log in and select a campaign to update options");
      return;
    }
    setLoading(true);
    try {
      await axios.patch(
        `${backendUrl}/campaigns/${editCampaign._id}/options`,
        { options: editOptions.filter((opt) => opt.trim() !== "") },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Options updated successfully!");
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update options");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !user) {
      toast.error("Please log in to delete a campaign");
      return;
    }
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    setLoading(true);
    try {
      await axios.delete(`${backendUrl}/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Campaign deleted successfully!");
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete campaign");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (id: string) => {
    if (!token || !user) {
      toast.error("Please log in to edit a campaign");
      return;
    }
    try {
      const response = await axios.get(`${backendUrl}/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditCampaign(response.data);
      setEditOptions(response.data.options.map((opt: any) => opt.label));
      setIsModalOpen(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch campaign");
    }
  };

  return (
    <div className="px-6 py-10">
      {/* Create Campaign Form */}
      <div className="bg-[#1a1a1d] rounded-xl border border-white/10 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-white">Create New Campaign</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="Campaign Title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="Describe your campaign"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Images (comma-separated URLs)
            </label>
            <input
              type="text"
              name="images"
              value={formData.images}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="https://image1.jpg,https://image2.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="e.g., Art, Music"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Price (minimum 0.001)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="0.001"
              step="0.001"
              min="0.001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Vote Options (minimum 2)
            </label>
            {formData.options.map((opt, index) => (
              <input
                key={index}
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                placeholder={`Option ${index + 1}`}
                required
              />
            ))}
            <button
              type="button"
              onClick={addOption}
              className="mt-2 px-4 py-2 rounded-full bg-[#222226] text-gray-300 hover:bg-[#2a2a2e] text-sm"
            >
              Add Option
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center w-full rounded-full font-medium text-lg px-8 py-3 bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Creating...
              </>
            ) : (
              "Create Campaign"
            )}
          </button>
        </form>
      </div>

      {/* Campaign List */}
      <div className="bg-[#1a1a1d] rounded-xl border border-white/10 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">My Campaigns</h2>
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="flex items-center px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-sm text-white"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-gray-400">You haven&apos;t created any campaigns yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-[#222226] hover:bg-[#2a2a2e] transition-all rounded-xl border border-white/10 p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold mb-1">{campaign.title}</h3>
                <p className="text-sm text-gray-400">{campaign.description}</p>
                <p className="text-sm text-gray-400 mt-2">Price: {campaign.price}</p>
                <p className="text-sm text-gray-400">Category: {campaign.category || "N/A"}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEditModal(campaign._id)}
                    className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(campaign._id)}
                    className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1d] rounded-xl p-6 w-full max-w-lg border border-white/10">
            <h2 className="text-lg font-semibold mb-4 text-white">Edit Campaign</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  value={editCampaign.title}
                  onChange={(e) =>
                    setEditCampaign({ ...editCampaign, title: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  value={editCampaign.description}
                  onChange={(e) =>
                    setEditCampaign({ ...editCampaign, description: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Images (comma-separated URLs)
                </label>
                <input
                  type="text"
                  value={editCampaign.images.join(",")}
                  onChange={(e) =>
                    setEditCampaign({
                      ...editCampaign,
                      images: e.target.value.split(",").map((img) => img.trim()),
                    })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <input
                  type="text"
                  value={editCampaign.category}
                  onChange={(e) =>
                    setEditCampaign({ ...editCampaign, category: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Price</label>
                <input
                  type="number"
                  value={editCampaign.price}
                  onChange={(e) =>
                    setEditCampaign({
                      ...editCampaign,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  step="0.001"
                  min="0.001"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center w-full rounded-full font-medium text-lg px-8 py-3 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Campaign"
                )}
              </button>
            </form>
            <h2 className="text-lg font-semibold mt-6 mb-4 text-white">Update Vote Options</h2>
            <form onSubmit={handleUpdateOptions} className="space-y-4">
              {editOptions.map((opt, index) => (
                <input
                  key={index}
                  type="text"
                  value={opt}
                  onChange={(e) => handleEditOptionChange(index, e.target.value)}
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-300 bg-[#222226] text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  placeholder={`Option ${index + 1}`}
                  required
                />
              ))}
              <button
                type="button"
                onClick={addEditOption}
                className="mt-2 px-4 py-2 rounded-full bg-[#222226] text-gray-300 hover:bg-[#2a2a2e] text-sm"
              >
                Add Option
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center w-full rounded-full font-medium text-lg px-8 py-3 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Updating Options...
                  </>
                ) : (
                  "Update Options"
                )}
              </button>
            </form>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 rounded-full bg-gray-600 hover:bg-gray-700 text-sm w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}