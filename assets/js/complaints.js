// نظام إدارة الشكاوى - Complaints Management System
// التعامل مع Google Sheets عبر Apps Script

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby7RjwNWgJTL6ynF1esHQ0sSUCKWoLS_a5LOIhY9MjSMCpmb567GDdSAcawiGnxfceX/exec'

// ============================================
// Toast Notification System
// ============================================
function showToast(message, type = 'info', title = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = 'position: fixed; top: 100px; right: 20px; z-index: 10000; pointer-events: none;';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill'
  };

  const colors = {
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f1c40f',
    info: '#3498db'
  };

  const defaultTitles = {
    success: 'نجح!',
    error: 'خطأ!',
    warning: 'تحذير!',
    info: 'معلومة'
  };

  const toastTitle = title || defaultTitles[type] || '';
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    pointer-events: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
    padding: 16px 20px;
    margin-bottom: 15px;
    min-width: 300px;
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.4s ease-out;
    border-right: 4px solid ${colors[type]};
  `;
  
  toast.innerHTML = `
    <i class="bi ${icons[type]}" style="font-size: 24px; flex-shrink: 0; color: ${colors[type]};"></i>
    <div style="flex: 1;">
      ${toastTitle ? `<div style="font-weight: 700; font-size: 14px; color: #2c3e50; margin-bottom: 4px;">${toastTitle}</div>` : ''}
      <div style="font-size: 13px; color: #7f8c8d; line-height: 1.4;">${message}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #95a5a6; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.3s;">
      <i class="bi bi-x"></i>
    </button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 400);
  }, 5000);

  return toast;
}

// ============================================
// Custom Prompt Modal
// ============================================
function showPrompt(message, placeholder = '', isTextarea = false) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      display: flex;
      position: fixed;
      z-index: 10000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s;
    `;
    
    const inputElement = isTextarea 
      ? `<textarea id="promptInput" placeholder="${placeholder}" rows="4" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 5px; font-size: 14px; resize: vertical; min-height: 44px; margin-bottom: 15px; font-family: inherit;"></textarea>`
      : `<input type="text" id="promptInput" placeholder="${placeholder}" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 5px; font-size: 14px; margin-bottom: 15px; font-family: inherit;">`;
    
    modal.innerHTML = `
      <div style="background-color: #fefefe; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3); animation: slideIn 0.3s;">
        <h3 style="margin-top: 0; color: #2c3e50; font-size: 20px; margin-bottom: 20px;">
          <i class="bi bi-chat-square-text"></i> ${message}
        </h3>
        ${inputElement}
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn-cancel" style="padding: 10px 20px; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; transition: 0.3s; font-size: 14px; background: #95a5a6; color: white;">
            <i class="bi bi-x"></i> إلغاء
          </button>
          <button class="btn-confirm" style="padding: 10px 20px; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; transition: 0.3s; font-size: 14px; background: #b10800; color: white;">
            <i class="bi bi-check"></i> تأكيد
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closePrompt = (action) => {
      const input = document.getElementById('promptInput');
      const value = action === 'confirm' ? input.value.trim() : null;
      modal.remove();
      resolve(value);
    };

    modal.querySelector('.btn-cancel').onclick = () => closePrompt(null);
    modal.querySelector('.btn-confirm').onclick = () => closePrompt('confirm');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePrompt(null);
    });

    setTimeout(() => {
      const input = document.getElementById('promptInput');
      input.focus();
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isTextarea) {
          closePrompt('confirm');
        }
      });
    }, 100);
  });
}

// ============================================
// Custom Confirm Dialog
// ============================================
function showConfirm(message, title = 'تأكيد') {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      display: flex;
      position: fixed;
      z-index: 10000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s;
    `;
    
    modal.innerHTML = `
      <div style="background-color: #fefefe; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3); animation: slideIn 0.3s;">
        <h3 style="margin-top: 0; color: #2c3e50; font-size: 20px; margin-bottom: 20px;">
          <i class="bi bi-question-circle"></i> ${title}
        </h3>
        <p style="color: #7f8c8d; margin-bottom: 20px;">${message}</p>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn-no" style="padding: 10px 20px; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; transition: 0.3s; font-size: 14px; background: #95a5a6; color: white;">
            <i class="bi bi-x"></i> لا
          </button>
          <button class="btn-yes" style="padding: 10px 20px; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; transition: 0.3s; font-size: 14px; background: #b10800; color: white;">
            <i class="bi bi-check"></i> نعم
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeConfirm = (confirmed) => {
      modal.remove();
      resolve(confirmed);
    };

    modal.querySelector('.btn-no').onclick = () => closeConfirm(false);
    modal.querySelector('.btn-yes').onclick = () => closeConfirm(true);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeConfirm(false);
    });
  });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideIn {
    from { transform: translateY(-50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

// ============================================
// Original Code Continues Below
// ============================================

// وظيفة لإرسال طلبات إلى Google Apps Script باستخدام JSONP
function callScript(action, data = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString().substr(2, 9);
    
    data.action = action;
    
    const params = new URLSearchParams();
    for (let key in data) {
      if (typeof data[key] === 'object') {
        params.append(key, JSON.stringify(data[key]));
      } else {
        params.append(key, data[key]);
      }
    }
    
    params.append('callback', callbackName);
    
    const finalUrl = `${SCRIPT_URL}?${params.toString()}`;
    console.log('Calling script:', finalUrl);
    
    window[callbackName] = function(response) {
      console.log('Response received:', response);
      delete window[callbackName];
      if (script && script.parentNode) {
        document.body.removeChild(script);
      }
      resolve(response);
    };
    
    const timeout = setTimeout(() => {
      delete window[callbackName];
      if (script && script.parentNode) {
        document.body.removeChild(script);
      }
      reject(new Error('Request timeout - تأكد من صحة رابط الـ Script وأنه تم نشره بشكل صحيح'));
    }, 30000);
    
    const script = document.createElement('script');
    script.src = finalUrl;
    script.onerror = function(e) {
      console.error('Script loading error:', e);
      clearTimeout(timeout);
      delete window[callbackName];
      if (script && script.parentNode) {
        document.body.removeChild(script);
      }
      reject(new Error('فشل تحميل السكريبت - تأكد من:\n1. رابط الـ Script صحيح\n2. تم نشر الـ Script كـ Web App\n3. الصلاحيات: Anyone'));
    };
    
    script.onload = function() {
      clearTimeout(timeout);
    };
    
    document.body.appendChild(script);
  });
}

// وظيفة للحصول على جميع الشكاوى
async function getAllComplaints() {
  try {
    const result = await callScript('getAllComplaints');
    return result.success ? result.complaints : [];
  } catch (error) {
    console.error('Error getting complaints:', error);
    return [];
  }
}

// التعامل مع نموذج تقديم الشكوى
if (document.getElementById('complaintForm')) {
  document.getElementById('complaintForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> جاري الإرسال...';

    const complaint = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      idNumber: document.getElementById('idNumber').value.trim(),
      type: document.getElementById('complaintType').value,
      title: document.getElementById('complaintTitle').value.trim(),
      description: document.getElementById('complaintDescription').value.trim()
    };

    try {
      console.log('Submitting complaint:', complaint);
      
      const result = await callScript('submitComplaint', complaint);
      
      console.log('Submit result:', result);

      if (result.success) {
        showToast('تم إرسال شكواك بنجاح! سنتواصل معك قريباً.', 'success', 'تم بنجاح');
        this.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result.message || 'فشل في إرسال الشكوى');
      }

    } catch (error) {
      console.error('Error saving complaint:', error);
      showToast(error.message || 'حدث خطأ في إرسال الشكوى. الرجاء المحاولة مرة أخرى.', 'error', 'خطأ');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// التعامل مع تسجيل دخول الإدارة
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginBtn = this.querySelector('button[type="submit"]');
    const originalText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> جاري تسجيل الدخول...';

    try {
      const result = await callScript('login', { username, password });

      if (result.success) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showToast('تم تسجيل الدخول بنجاح', 'success');
        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 500);
      } else {
        showToast('اسم المستخدم أو كلمة المرور غير صحيحة', 'error', 'فشل تسجيل الدخول');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'خطأ في تسجيل الدخول', 'error');
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = originalText;
    }
  });
}

// التحقق من تسجيل الدخول في صفحات الإدارة
function checkAdminAuth() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  if (!isLoggedIn && !window.location.href.includes('admin-login.html')) {
    window.location.href = 'admin-login.html';
  }
}

// حساب نسبة الإجراءات المكتملة
function calculateActionProgress(status) {
  const statusProgress = {
    'pending': 0,
    'read': 33,
    'resolved': 100,
    'rejected': 100
  };
  return statusProgress[status] || 0;
}

// عرض جميع الشكاوى في لوحة التحكم
async function displayComplaints() {
  const complaintsTableBody = document.getElementById('complaintsTableBody');
  if (!complaintsTableBody) return;

  complaintsTableBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">جاري التحميل...</span>
        </div>
      </td>
    </tr>
  `;

  try {
    const complaints = await getAllComplaints();
    
    if (complaints.length === 0) {
      complaintsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            <i class="bi bi-inbox" style="font-size: 48px; color: #ccc;"></i>
            <p class="mt-2">لا توجد شكاوى حالياً</p>
          </td>
        </tr>
      `;
      return;
    }

    complaints.sort((a, b) => b.timestamp - a.timestamp);

    complaintsTableBody.innerHTML = complaints.map(complaint => {
      const statusBadge = getStatusBadge(complaint.status);
      const progress = calculateActionProgress(complaint.status);
      
      return `
        <tr onclick="viewComplaint('${complaint.id}')" style="cursor: pointer;">
          <td>
            ${complaint.title}
            <div class="action-progress">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </td>
          <td>${complaint.firstName} ${complaint.lastName}</td>
          <td>${complaint.type}</td>
          <td>${complaint.date}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');

    updateDashboardStats(complaints);
  } catch (error) {
    console.error('Error displaying complaints:', error);
    complaintsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-danger">
          <p>خطأ في تحميل الشكاوى</p>
          <small>${error.message}</small>
        </td>
      </tr>
    `;
  }
}

// الحصول على شارة الحالة
function getStatusBadge(status) {
  const badges = {
    'pending': '<span class="badge badge-warning" style="background: #99b3c5;">قيد الانتظار</span>',
    'read': '<span class="badge" style="background: #3498db; color: white;">تم القراءة</span>',
    'resolved': '<span class="badge badge-success" style="background: #53db34;">تم الحل</span>',
    'rejected': '<span class="badge badge-danger" style="background: #db3434;">مرفوضة</span>'
  };
  return badges[status] || badges['pending'];
}

// تحديث إحصائيات لوحة التحكم
function updateDashboardStats(complaints) {
  const totalElement = document.getElementById('totalComplaints');
  const pendingElement = document.getElementById('pendingComplaints');
  const resolvedElement = document.getElementById('resolvedComplaints');

  if (totalElement) totalElement.textContent = complaints.length;
  if (pendingElement) {
    const pending = complaints.filter(c => c.status === 'pending' || c.status === 'read').length;
    pendingElement.textContent = pending;
  }
  if (resolvedElement) {
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    resolvedElement.textContent = resolved;
  }
}

// عرض شكوى واحدة
function viewComplaint(id) {
  sessionStorage.setItem('currentComplaintId', id);
  window.location.href = 'complaint-details.html';
}

// عرض تفاصيل الشكوى في صفحة التفاصيل
async function displayComplaintDetails() {
  const complaintId = sessionStorage.getItem('currentComplaintId');
  if (!complaintId) {
    window.location.href = 'admin-dashboard.html';
    return;
  }

  const complaints = await getAllComplaints();
  const complaint = complaints.find(c => c.id === complaintId);

  if (!complaint) {
    alert('الشكوى غير موجودة');
    window.location.href = 'admin-dashboard.html';
    return;
  }

  document.getElementById('detailTitle').textContent = complaint.title;
  document.getElementById('detailName').textContent = `${complaint.firstName} ${complaint.lastName}`;
  document.getElementById('detailPhone').textContent = complaint.phone;
  document.getElementById('detailEmail').textContent = complaint.email;
  document.getElementById('detailIdNumber').textContent = complaint.idNumber;
  document.getElementById('detailType').textContent = complaint.type;
  document.getElementById('detailDate').textContent = complaint.date;
  document.getElementById('detailStatus').innerHTML = getStatusBadge(complaint.status);
  document.getElementById('detailDescription').textContent = complaint.description;
}

// وضع علامة "تم القراءة"
async function markAsRead() {
  const complaintId = sessionStorage.getItem('currentComplaintId');

  try {
    const result = await callScript('updateComplaintStatus', {
      id: complaintId,
      status: 'read'
    });

    if (result.success) {
      await displayComplaintDetails();
      showToast('تم وضع علامة "تم القراءة" وإرسال بريد إلكتروني للمستخدم', 'success');
    } else {
      showToast('حدث خطأ: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('Error marking as read:', error);
    showToast('حدث خطأ في العملية', 'error');
  }
}

// حل الشكوى
async function resolveComplaint() {
  const confirmed = await showConfirm('هل أنت متأكد من حل هذه الشكوى؟', 'تأكيد الحل');
  if (!confirmed) return;

  const complaintId = sessionStorage.getItem('currentComplaintId');

  try {
    const result = await callScript('updateComplaintStatus', {
      id: complaintId,
      status: 'resolved'
    });

    if (result.success) {
      showToast('تم حل الشكوى وإرسال بريد إلكتروني للمستخدم', 'success');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1000);
    } else {
      showToast('حدث خطأ: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('Error resolving complaint:', error);
    showToast('حدث خطأ في العملية', 'error');
  }
}

// إظهار نافذة الرفض
async function rejectComplaint() {
  const reason = await showPrompt('الرجاء إدخال سبب رفض الشكوى:', 'اكتب السبب هنا...', true);
  
  if (!reason) {
    showToast('لم يتم إدخال سبب الرفض', 'warning');
    return;
  }

  const complaintId = sessionStorage.getItem('currentComplaintId');

  try {
    const result = await callScript('updateComplaintStatus', {
      id: complaintId,
      status: 'rejected',
      rejectionReason: reason
    });

    if (result.success) {
      showToast('تم رفض الشكوى وإرسال بريد إلكتروني للمستخدم', 'success');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1000);
    } else {
      showToast('حدث خطأ: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('Error rejecting complaint:', error);
    showToast('حدث خطأ في العملية', 'error');
  }
}

// حذف الشكوى
async function deleteComplaint() {
  const confirmed = await showConfirm('هل أنت متأكد من حذف هذه الشكوى؟ لا يمكن التراجع عن هذا الإجراء.', 'تأكيد الحذف');
  if (!confirmed) return;

  const complaintId = sessionStorage.getItem('currentComplaintId');

  try {
    const result = await callScript('deleteComplaint', {
      id: complaintId
    });

    if (result.success) {
      showToast('تم حذف الشكوى بنجاح', 'success');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1000);
    } else {
      showToast('حدث خطأ: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('Error deleting complaint:', error);
    showToast('حدث خطأ في العملية', 'error');
  }
}

// تسجيل الخروج
function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.href = 'admin-login.html';
}

// التصدير إلى Excel
async function exportToExcel() {
  const complaints = await getAllComplaints();
  
  let csv = 'العنوان,الاسم الأول,الاسم الأخير,الهاتف,البريد الإلكتروني,رقم الهوية,النوع,التاريخ,الحالة\n';
  
  complaints.forEach(c => {
    csv += `"${c.title}","${c.firstName}","${c.lastName}","${c.phone}","${c.email}","${c.idNumber}","${c.type}","${c.date}","${c.status}"\n`;
  });

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

// تهيئة الصفحة حسب نوعها
document.addEventListener('DOMContentLoaded', function() {
  // صفحة لوحة التحكم
  if (document.getElementById('complaintsTableBody')) {
    checkAdminAuth();
    displayComplaints();
  }

  // صفحة تفاصيل الشكوى
  if (document.getElementById('detailTitle')) {
    checkAdminAuth();
    displayComplaintDetails();
  }
});
