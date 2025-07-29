"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import MyCampaign from "./campaign/MyCampaign";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  price: number;
  status: string;
  options: { label: string; count: number; _id: string }[];
  creator: { _id: string; fullName: string };
  participants?: { user: { _id: string; fullName: string; email: string }; hasPaid: boolean; amountPaid: number; _id: string }[];
  topParticipantImage?: string;
  allParticipantsImage?: string;
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
    images: FileList | null;
    category: string;
    price: string;
    options: string[];
    topParticipantImage: FileList | null;
    allParticipantsImage: FileList | null;
  }>({
    title: "",
    description: "",
    images: null,
    category: "",
    price: "",
    options: ["", ""],
    topParticipantImage: null,
    allParticipantsImage: null,
  });
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [editOptions, setEditOptions] = useState<string[]>(["", ""]);
  const [editImages, setEditImages] = useState<FileList | null>(null);
  const [editTopParticipantImage, setEditTopParticipantImage] = useState<FileList | null>(null);
  const [editAllParticipantsImage, setEditAllParticipantsImage] = useState<FileList | null>(null);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (
      files &&
      Array.from(files).every((file) => file.type.startsWith("image/"))
    ) {
      setFormData({ ...formData, [name]: files });
    } else {
      toast.error("Please select valid image files (e.g., PNG, JPEG)");
      e.target.value = ""; // Reset input
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (
      files &&
      Array.from(files).every((file) => file.type.startsWith("image/"))
    ) {
      if (name === "images") setEditImages(files);
      if (name === "topParticipantImage") setEditTopParticipantImage(files);
      if (name === "allParticipantsImage") setEditAllParticipantsImage(files);
    } else {
      toast.error("Please select valid image files (e.g., PNG, JPEG)");
      e.target.value = ""; // Reset input
    }
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
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("price", formData.price);
      formData.options
        .filter((opt) => opt.trim() !== "")
        .forEach((opt) => data.append("options[]", opt));
      if (formData.images) {
        Array.from(formData.images).forEach((file) =>
          data.append("images", file)
        );
      }
      if (formData.topParticipantImage) {
        Array.from(formData.topParticipantImage).forEach((file) =>
          data.append("topParticipantImage", file)
        );
      }
      if (formData.allParticipantsImage) {
        Array.from(formData.allParticipantsImage).forEach((file) =>
          data.append("allParticipantsImage", file)
        );
      }

      await axios.post(`${backendUrl}/campaigns`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Campaign created successfully!");
      setFormData({
        title: "",
        description: "",
        images: null,
        category: "",
        price: "",
        options: ["", ""],
        topParticipantImage: null,
        allParticipantsImage: null,
      });
      (document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>).forEach(
        (input) => (input.value = "")
      ); // Reset file inputs
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
      const data = new FormData();
      data.append("title", editCampaign.title);
      data.append("description", editCampaign.description);
      data.append("category", editCampaign.category);
      data.append("price", editCampaign.price.toString());
      data.append("status", editCampaign.status);
      if (editImages) {
        Array.from(editImages).forEach((file) => data.append("images", file));
      }
      if (editTopParticipantImage) {
        Array.from(editTopParticipantImage).forEach((file) =>
          data.append("topParticipantImage", file)
        );
      }
      if (editAllParticipantsImage) {
        Array.from(editAllParticipantsImage).forEach((file) =>
          data.append("allParticipantsImage", file)
        );
      }

      await axios.patch(`${backendUrl}/campaigns/${editCampaign._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Campaign updated successfully!");
      setIsModalOpen(false);
      setEditImages(null);
      setEditTopParticipantImage(null);
      setEditAllParticipantsImage(null);
      (document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>).forEach(
        (input) => (input.value = "")
      ); // Reset file inputs
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

  const openEditModal = async (campaign: Campaign) => {
    if (!token || !user) {
      toast.error("Please log in to edit a campaign");
      return;
    }
    try {
      setEditCampaign(campaign);
      setEditOptions(campaign.options.map((opt: any) => opt.label));
      setEditImages(null);
      setEditTopParticipantImage(null);
      setEditAllParticipantsImage(null);
      setIsModalOpen(true);
    } catch (error: any) {
      toast.error("Failed to open edit modal");
    }
  };

  return (
    <div className="px-6 py-10">
      {/* Create Campaign Form */}
      <div className="bg-[#1a1a1d] rounded-xl border border-white/10 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-white">
          Create New Campaign
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
              placeholder="Campaign Title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
              placeholder="Describe your campaign..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Images
            </label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white file:hover:bg-indigo-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Top Participant Image (Optional)
            </label>
            <input
              type="file"
              name="topParticipantImage"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white file:hover:bg-indigo-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              All Participants Image (Optional)
            </label>
            <input
              type="file"
              name="allParticipantsImage"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white file:hover:bg-indigo-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
              placeholder="e.g., Art, Music"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Price (minimum 0.001)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
              placeholder="0.001"
              step="0.001"
              min="0.001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Vote Options (minimum 2)
            </label>
            {formData.options.map((opt, index) => (
              <input
                key={index}
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                placeholder={`Option ${index + 1}`}
                required
              />
            ))}
            <button
              type="button"
              onClick={addOption}
              className="mt-2 px-4 py-2 rounded-full bg-[#222226] text-gray-400 hover:bg-[#2a2a2e] text-sm"
            >
              Add Option
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center w-full rounded-full font-medium text-sm px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white"
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
      <MyCampaign
        campaigns={campaigns}
        loading={loading}
        fetchCampaigns={fetchCampaigns}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
        backendUrl={backendUrl}
        user={user}
        token={token}
      />

      {/* Edit Modal */}
      {isModalOpen && editCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1d] h-[90%] overflow-y-scroll rounded-xl p-6 w-full max-w-lg border border-white/10">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Edit Campaign
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Title
                </label>
                <input
                  type="text"
                  value={editCampaign.title}
                  onChange={(e) =>
                    setEditCampaign({ ...editCampaign, title: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Description
                </label>
                <textarea
                  value={editCampaign.description}
                  onChange={(e) =>
                    setEditCampaign({
                      ...editCampaign,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Images
                </label>
                {editCampaign.images.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-400">Current Images:</p>
                    <ul className="list-disc list-inside text-sm text-gray-500">
                      {editCampaign.images.map((url, index) => (
                        <li key={index}>
                          <a
                            href={`${backendUrl}${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-gray-300"
                          >
                            Image {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleEditFileChange}
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white file:hover:bg-indigo-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Top Participant Image
                </label>
                {editCampaign.topParticipantImage && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-400">Current Top Participant Image:</p>
                    <a
                      href={`${backendUrl}${editCampaign.topParticipantImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-gray-300 text-sm"
                    >
                      View Image
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  name="topParticipantImage"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white file:hover:bg-indigo-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  All Participants Image
                </label>
                {editCampaign.allParticipantsImage && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-400">Current All Participants Image:</p>
                    <a
                      href={`${backendUrl}${editCampaign.allParticipantsImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-gray-300 text-sm"
                    >
                      View Image
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  name="allParticipantsImage"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white file:hover:bg-indigo-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Category
                </label>
                <input
                  type="text"
                  value={editCampaign.category}
                  onChange={(e) =>
                    setEditCampaign({
                      ...editCampaign,
                      category: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Price
                </label>
                <input
                  type="number"
                  value={editCampaign.price}
                  onChange={(e) =>
                    setEditCampaign({
                      ...editCampaign,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                  step="0.001"
                  min="0.001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Status
                </label>
                <select
                  name="status"
                  value={editCampaign.status}
                  onChange={(e) =>
                    setEditCampaign({
                      ...editCampaign,
                      status: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center w-full rounded-full font-medium text-sm px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white"
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
            <h2 className="text-lg font-semibold mt-6 mb-4 text-white">
              Update Vote Options
            </h2>
            <form onSubmit={handleUpdateOptions} className="space-y-4">
              {editOptions.map((opt, index) => (
                <input
                  key={index}
                  type="text"
                  value={opt}
                  onChange={(e) =>
                    handleEditOptionChange(index, e.target.value)
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-full border border-gray-600 bg-[#222226] text-white shadow-sm focus:ring-indigo-600 focus:border-indigo-600 text-sm"
                  placeholder={`Option ${index + 1}`}
                  required
                />
              ))}
              <button
                type="button"
                onClick={addEditOption}
                className="mt-2 px-4 py-2 rounded-full bg-[#222226] text-gray-400 hover:bg-[#2a2a2e] text-sm"
              >
                Add Option
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center w-full rounded-full font-medium text-sm px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white"
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
              className="mt-4 px-4 py-2 rounded-full bg-gray-600 hover:bg-gray-700 text-sm w-full text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}