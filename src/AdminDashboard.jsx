import { useState } from "react";
import { useEffect } from "react";
import { useVisits } from "./VisitsContext.jsx";
import { users } from "./storage";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { cars, addCar, deleteCar } = useVisits();

  const [staffEmail, setStaffEmail] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffAddress, setStaffAddress] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState("staff"); // "staff", "guests", or "cars"
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("staff"); // "staff" or "users"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [lastCommand, setLastCommand] = useState("");

  // Car form fields
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carPrice, setCarPrice] = useState("");
  const [carBody, setCarBody] = useState("");
  const [carMileage, setCarMileage] = useState("");
  const [carShortDescription, setCarShortDescription] = useState("");
  const [carDescription, setCarDescription] = useState("");
  const [carImageUrl, setCarImageUrl] = useState("");
  const [carImageFile, setCarImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (messageType === "success" && message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, messageType]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (!staffEmail || !staffName) {
        throw new Error("Name and Email are required");
      }

      // Password is required when creating, optional when editing
      if (!editingStaffId && !staffPassword) {
        throw new Error("Password is required when creating a new staff member");
      }

      if (editingStaffId) {
        // Update existing staff
        const existing = users.findById(editingStaffId);
        if (!existing) {
          throw new Error("Staff member not found");
        }

        // Check if email is being changed and if new email already exists
        if (staffEmail.toLowerCase() !== existing.email.toLowerCase()) {
          const emailExists = users.findByEmail(staffEmail);
          if (emailExists && emailExists.id !== editingStaffId) {
            throw new Error("Email already exists");
          }
        }

        const updateData = {
          email: staffEmail.toLowerCase(),
          display_name: staffName,
          phone: staffPhone,
          address: staffAddress,
        };
        // Only update password if a new one was provided
        if (staffPassword) {
          updateData.password = staffPassword;
        }
        users.update(editingStaffId, updateData);

        setMessage(`Staff account updated: ${staffEmail}`);
        setMessageType('success');
        setEditingStaffId(null);
      } else {
        // Create new staff
        const existing = users.findByEmail(staffEmail);
        if (existing) {
          throw new Error("Email already exists");
        }

        users.create({
          email: staffEmail.toLowerCase(),
          password: staffPassword,
          display_name: staffName,
          role: 'front_desk',
          phone: staffPhone,
          address: staffAddress,
        });

        setMessage(`Staff account created: ${staffEmail}`);
        setMessageType('success');
      }

      setStaffEmail("");
      setStaffName("");
      setStaffPassword("");
      setStaffPhone("");
      setStaffAddress("");
      fetchStaffList();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = () => {
    try {
      const allUsers = users.getAll();
      const staff = allUsers
        .filter(u => u.role === 'front_desk' || u.role === 'admin')
        .map(u => ({
          id: u.id,
          email: u.email,
          displayName: u.display_name,
          role: u.role,
          phone: u.phone || '',
          address: u.address || '',
          createdAt: u.created_at,
        }));
      setStaffList(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffList([]);
    }
  };

  const fetchUsersList = () => {
    try {
      const allUsers = users.getAll();
      const regularUsers = allUsers
        .filter(u => u.role === 'user')
        .map(u => ({
          id: u.id,
          email: u.email,
          displayName: u.display_name,
          role: u.role,
          createdAt: u.created_at,
        }));
      setUsersList(regularUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersList([]);
    }
  };

  // fetch staff and users list on mount
  useEffect(() => {
    fetchStaffList();
    fetchUsersList();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return "";
    try {
      if (ts.toDate) return ts.toDate().toLocaleString();
      if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
      if (ts instanceof Date) return ts.toLocaleString();
      return String(ts);
    } catch (e) {
      return String(ts);
    }
  };

  const copyCommand = async () => {
    if (!lastCommand) return;
    try {
      await navigator.clipboard.writeText(lastCommand);
      setMessage("Command copied to clipboard");
      setMessageType("success");
    } catch (err) {
      setMessage("Could not copy command automatically. Please copy it manually.");
      setMessageType("error");
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;

    setUploadingImage(true);
    try {
      // Compress and resize image to reduce localStorage usage
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // Create canvas to resize and compress
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 600;
            const MAX_SIZE_KB = 200; // Target max size in KB

            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
              if (width > MAX_WIDTH) {
                height = (height * MAX_WIDTH) / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = (width * MAX_HEIGHT) / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress with quality adjustment
            let quality = 0.85;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);

            // If still too large, reduce quality further
            while (dataUrl.length > MAX_SIZE_KB * 1024 && quality > 0.3) {
              quality -= 0.1;
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }

            setUploadingImage(false);
            resolve(dataUrl);
          };
          img.onerror = () => {
            setUploadingImage(false);
            reject(new Error('Failed to load image'));
          };
          img.src = e.target.result;
        };
        reader.onerror = (e) => {
          setUploadingImage(false);
          reject(e);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      setUploadingImage(false);
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const handleAddOrUpdateCar = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (!carMake || !carModel || !carYear || !carPrice) {
        throw new Error("Make, Model, Year, and Price are required");
      }

      let finalImageUrl = carImageUrl;

      // Upload image if a file was selected
      if (carImageFile) {
        finalImageUrl = await handleImageUpload(carImageFile);
      }

      // When editing, preserve existing image if no new file was uploaded
      // When adding new, require an image (fallback to default if somehow missing)
      if (editingCarId && !carImageFile && !finalImageUrl) {
        // This shouldn't happen, but if it does, try to get the existing car's image
        const existingCar = cars.find(c => c.id === editingCarId);
        if (existingCar && existingCar.imageUrl) {
          finalImageUrl = existingCar.imageUrl;
        }
      }

      const carData = {
        id: editingCarId || `${carMake.toLowerCase()}-${carModel.toLowerCase()}-${carYear}`.replace(/\s+/g, '-'),
        make: carMake,
        model: carModel,
        year: parseInt(carYear),
        price: parseInt(carPrice),
        body: carBody || "Sedan",
        mileage: carMileage || "0 km",
        shortDescription: carShortDescription || "",
        description: carDescription.split('\n').filter(line => line.trim()),
        imageUrl: finalImageUrl || (editingCarId ? carImageUrl : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=480&fit=crop")
      };

      if (editingCarId) {
        // Update existing car
        deleteCar(editingCarId);
        addCar(carData);
        setMessage("Car updated successfully");
      } else {
        // Add new car
        addCar(carData);
        setMessage("Car added successfully");
      }

      setMessageType("success");
      resetCarForm();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const resetCarForm = () => {
    setCarMake("");
    setCarModel("");
    setCarYear("");
    setCarPrice("");
    setCarBody("");
    setCarMileage("");
    setCarShortDescription("");
    setCarDescription("");
    setCarImageUrl("");
    setCarImageFile(null);
    setEditingCarId(null);
    // Clear the file input field
    const fileInput = document.getElementById('carImageInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleEditCar = (car) => {
    setCarMake(car.make);
    setCarModel(car.model);
    setCarYear(car.year.toString());
    setCarPrice(car.price.toString());
    setCarBody(car.body);
    setCarMileage(car.mileage);
    setCarShortDescription(car.shortDescription);
    setCarDescription(Array.isArray(car.description) ? car.description.join('\n') : car.description);
    setCarImageUrl(car.imageUrl);
    setCarImageFile(null);
    setEditingCarId(car.id);
    setActiveTab("cars");
    // Clear the file input field
    const fileInput = document.getElementById('carImageInput');
    if (fileInput) {
      fileInput.value = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCar = (carId, carName) => {
    if (!window.confirm(`Are you sure you want to delete ${carName}?`)) {
      return;
    }
    deleteCar(carId);
    setMessage("Car deleted successfully");
    setMessageType("success");
  };

  const handleEditStaff = (staff) => {
    setStaffName(staff.displayName || '');
    setStaffEmail(staff.email);
    setStaffPassword(''); // Don't pre-fill password for security
    setStaffPhone(staff.phone || '');
    setStaffAddress(staff.address || '');
    setEditingStaffId(staff.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditStaff = () => {
    setStaffEmail("");
    setStaffName("");
    setStaffPassword("");
    setStaffPhone("");
    setStaffAddress("");
    setEditingStaffId(null);
  };

  const handleDeleteStaff = (staffId, staffEmail) => {
    if (!window.confirm(`Are you sure you want to delete ${staffEmail}?`)) {
      return;
    }

    try {
      const user = users.findById(staffId);
      if (!user) {
        throw new Error('Staff member not found');
      }

      // Only allow deleting front_desk staff, not admin
      if (user.role !== 'front_desk') {
        throw new Error('Can only delete front desk staff');
      }

      users.delete(staffId);
      setMessage('Staff member deleted successfully');
      setMessageType('success');
      fetchStaffList();
    } catch (error) {
      setMessage(`Error deleting staff: ${error.message}`);
      setMessageType('error');
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-content">
        <div className="add-staff-section">
          <h2>{editingStaffId ? 'Edit Front Desk Staff' : 'Add Front Desk Staff'}</h2>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleAddStaff} autoComplete="off">
            <div className="form-group">
              <label htmlFor="staffName">Staff Name *</label>
              <input
                id="staffName"
                name="staff-name"
                type="text"
                placeholder="e.g., John Smith"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="staffEmail">Email *</label>
              <input
                id="staffEmail"
                name="staff-email"
                type="email"
                placeholder="e.g., john@ali-autos.com"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="staffPassword">{editingStaffId ? 'New Password' : 'Temporary Password *'}</label>
              <input
                id="staffPassword"
                name="staff-password"
                type="password"
                placeholder={editingStaffId ? "Leave blank to keep current password" : "Create a temporary password"}
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                required={!editingStaffId}
                autoComplete="new-password"
              />
              {editingStaffId && <small>Leave blank to keep current password</small>}
            </div>

            <div className="form-group">
              <label htmlFor="staffPhone">Phone Number</label>
              <input
                id="staffPhone"
                name="staff-phone"
                type="tel"
                placeholder="e.g., +234 123 456 7890"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="staffAddress">Address</label>
              <textarea
                id="staffAddress"
                name="staff-address"
                placeholder="e.g., 123 Main Street, Lagos, Nigeria"
                value={staffAddress}
                onChange={(e) => setStaffAddress(e.target.value)}
                rows="3"
                autoComplete="off"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={{ flex: 1 }}>
                {loading ? (editingStaffId ? "Updating..." : "Adding...") : (editingStaffId ? "Update Staff Member" : "Add Staff Member")}
              </button>
              {editingStaffId && (
                <button
                  type="button"
                  onClick={handleCancelEditStaff}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="staff-list-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Users</h2>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' }}>
            <button
              onClick={() => { setActiveTab('staff'); setSearchQuery(''); handleCancelEditStaff(); }}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'staff' ? '#0052CC' : 'transparent',
                color: activeTab === 'staff' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'staff' ? '3px solid #0052CC' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'staff' ? 'bold' : 'normal'
              }}
            >
              Front Desk Staff
            </button>
            <button
              onClick={() => { setActiveTab('guests'); setSearchQuery(''); handleCancelEditStaff(); }}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'guests' ? '#0052CC' : 'transparent',
                color: activeTab === 'guests' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'guests' ? '3px solid #0052CC' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'guests' ? 'bold' : 'normal'
              }}
            >
              Users
            </button>
            <button
              onClick={() => { setActiveTab('cars'); resetCarForm(); handleCancelEditStaff(); }}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'cars' ? '#0052CC' : 'transparent',
                color: activeTab === 'cars' ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === 'cars' ? '3px solid #0052CC' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'cars' ? 'bold' : 'normal'
              }}
            >
              Manage Cars
            </button>
          </div>

          {/* Search Box - Only show for staff and users tabs */}
          {(activeTab === 'staff' || activeTab === 'guests') && (
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Front Desk Staff Tab */}
          {activeTab === 'staff' && (
            <>
              {staffList.filter(s => s.email.includes(searchQuery) && s.role === 'front_desk').length === 0 ? (
                <p>{staffList.filter(s => s.role === 'front_desk').length === 0 ? 'No front desk staff added yet' : 'No results matching your search'}</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Address</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.filter(s => s.email.includes(searchQuery) && s.role === 'front_desk').map(staff => (
                      <tr key={staff.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{staff.displayName || '-'}</td>
                        <td style={{ padding: '12px' }}>{staff.email}</td>
                        <td style={{ padding: '12px' }}>{staff.phone || '-'}</td>
                        <td style={{ padding: '12px' }}>{staff.address || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEditStaff(staff)}
                            style={{
                              padding: '6px 14px',
                              backgroundColor: '#0052CC',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginRight: '5px'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(staff.id, staff.email)}
                            style={{
                              padding: '6px 14px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* Guest Users Tab */}
          {activeTab === 'guests' && (
            <>
              {usersList.filter(u => u.email.includes(searchQuery)).length === 0 ? (
                <p>{usersList.length === 0 ? 'No users have signed up yet' : 'No results matching your search'}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {usersList.filter(u => u.email.includes(searchQuery)).map(user => (
                    <div key={user.id} style={{
                      padding: '10px 12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      {user.email}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Manage Cars Tab */}
          {activeTab === 'cars' && (
            <div>
              <h3>{editingCarId ? 'Edit Car' : 'Add New Car'}</h3>
              <form onSubmit={handleAddOrUpdateCar} style={{ marginBottom: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Make *</label>
                    <input
                      type="text"
                      placeholder="e.g., Toyota"
                      value={carMake}
                      onChange={(e) => setCarMake(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Model *</label>
                    <input
                      type="text"
                      placeholder="e.g., Camry"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Year *</label>
                    <input
                      type="number"
                      placeholder="e.g., 2021"
                      value={carYear}
                      onChange={(e) => setCarYear(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (₦) *</label>
                    <input
                      type="number"
                      placeholder="e.g., 10500000"
                      value={carPrice}
                      onChange={(e) => setCarPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Body Type</label>
                    <input
                      type="text"
                      placeholder="e.g., Sedan, SUV, Coupe"
                      value={carBody}
                      onChange={(e) => setCarBody(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mileage</label>
                    <input
                      type="text"
                      placeholder="e.g., 34,000 km"
                      value={carMileage}
                      onChange={(e) => setCarMileage(e.target.value)}
                    />
                  </div>


                  <div className="form-group">
                    <label>Upload Image {!editingCarId && '*'}</label>
                    <input
                      type="file"
                      accept="image/*"
                      id="carImageInput"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setCarImageFile(file);
                          setCarImageUrl("");
                        }
                      }}
                      required={!editingCarId}
                    />
                    {carImageFile && (
                      <div style={{ marginTop: '10px' }}>
                        <img
                          src={URL.createObjectURL(carImageFile)}
                          alt="Preview"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '150px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                        />
                      </div>
                    )}
                    {editingCarId && carImageUrl && !carImageFile && (
                      <div style={{ marginTop: '10px' }}>
                        <img
                          src={carImageUrl}
                          alt="Current car image"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '150px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Short Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Smooth drive, low mileage"
                    value={carShortDescription}
                    onChange={(e) => setCarShortDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Full Description (one feature per line)</label>
                  <textarea
                    placeholder="Single owner.&#10;Passed full Ali Autos inspection.&#10;No accident history."
                    value={carDescription}
                    onChange={(e) => setCarDescription(e.target.value)}
                    rows="5"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading || uploadingImage} style={{ flex: 1 }}>
                    {uploadingImage ? 'Uploading Image...' : loading ? 'Saving...' : editingCarId ? 'Update Car' : 'Add Car'}
                  </button>
                  {editingCarId && (
                    <button
                      type="button"
                      onClick={resetCarForm}
                      style={{
                        flex: 1,
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              <h3>Current Inventory ({cars.length} cars)</h3>
              {cars.length === 0 ? (
                <p>No cars in inventory</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Image</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Make/Model</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Year</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Price</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map(car => (
                      <tr key={car.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>
                          <img
                            src={car.imageUrl}
                            alt={`${car.make} ${car.model}`}
                            style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>{car.make} {car.model}</td>
                        <td style={{ padding: '12px' }}>{car.year}</td>
                        <td style={{ padding: '12px' }}>₦{car.price.toLocaleString('en-NG')}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEditCar(car)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#0052CC',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginRight: '5px'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car.id, `${car.make} ${car.model}`)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
