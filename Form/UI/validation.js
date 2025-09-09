document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
    const modal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');

    const inputs = {
        fullNameArabic: { id: 'fullNameArabic', validation: 'text', name: 'الاسم بالعربي' },
        fullNameEnglish: { id: 'fullNameEnglish', validation: 'text', name: 'الاسم بالانجليزي' },
        email: { id: 'email', validation: 'email', name: 'الايميل' },
        mobile: { id: 'mobile', validation: 'mobile', name: 'رقم الموبايل' },
        nationalId: { id: 'nationalId', validation: 'nationalId', name: 'الرقم القومي' },
        age: { id: 'age', validation: 'number', name: 'السن' },
        education: { id: 'education', validation: 'text', name: 'المؤهل' },
        governorate: { id: 'governorate', validation: 'select', name: 'المحافظة' },
        source: { id: 'source', validation: 'text', name: 'مصدر المعرفة' },
        gender: { name: 'gender', validation: 'radio', displayName: 'النوع' }
    };

    const setError = (element, message) => {
        const formGroup = element.closest('.form-group');
        const errorDisplay = formGroup.querySelector('.error-message');
        errorDisplay.innerText = message;
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
    };

    const setSuccess = (element) => {
        const formGroup = element.closest('.form-group');
        const errorDisplay = formGroup.querySelector('.error-message');
        errorDisplay.innerText = '';
        formGroup.classList.add('success');
        formGroup.classList.remove('error');
    };

    const validateField = (field) => {
        const element = document.getElementById(field.id);
        const value = element ? element.value.trim() : '';
        let isValid = true;

        switch (field.validation) {
            case 'text':
                if (value === '') {
                    setError(element, `${field.name} مطلوب`);
                    isValid = false;
                } else {
                    setSuccess(element);
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value === '') {
                    setError(element, 'الايميل مطلوب');
                    isValid = false;
                } else if (!emailRegex.test(value)) {
                    setError(element, 'صيغة الايميل غير صحيحة');
                    isValid = false;
                } else {
                    setSuccess(element);
                }
                break;
            case 'mobile':
                if (value === '') {
                    setError(element, 'رقم الموبايل مطلوب');
                    isValid = false;
                } else if (!/^\d{11}$/.test(value)) {
                    setError(element, 'يجب أن يتكون من 11 رقمًا');
                    isValid = false;
                } else {
                    setSuccess(element);
                }
                break;
            case 'nationalId':
                if (value === '') {
                    setError(element, 'الرقم القومي مطلوب');
                    isValid = false;
                } else if (!/^\d{14}$/.test(value)) {
                    setError(element, 'يجب أن يتكون من 14 رقمًا');
                    isValid = false;
                } else {
                    setSuccess(element);
                }
                break;
            case 'number':
                if (value === '') {
                    setError(element, `${field.name} مطلوب`);
                    isValid = false;
                } else {
                    setSuccess(element);
                }
                break;
            case 'select':
                if (element.value === '') {
                    setError(element, `يجب اختيار ${field.name}`);
                    isValid = false;
                } else {
                    setSuccess(element);
                }
                break;
            case 'radio':
                const radioButtons = document.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(radioButtons).some(radio => radio.checked);
                const formGroup = radioButtons[0].closest('.form-group');
                if (!isChecked) {
                    setError(radioButtons[0], `يجب اختيار ${field.displayName}`);
                    isValid = false;
                } else {
                    setSuccess(radioButtons[0]);
                }
                break;
        }
        return isValid;
    };

    const validateForm = () => {
        let isFormValid = true;
        for (const key in inputs) {
            if (!validateField(inputs[key])) {
                isFormValid = false;
            }
        }
        return isFormValid;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const formData = new FormData(form);
            try {
                const response = await fetch('/submit', {
                    method: 'POST',
                    body: new URLSearchParams(formData)
                });

                if (response.ok) {
                    modal.style.display = 'flex';
                    form.reset();
                    document.querySelectorAll('.form-group').forEach(group => {
                        group.classList.remove('success');
                    });
                } else {
                    alert('حدث خطأ أثناء إرسال البيانات.');
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.');
            }
        }
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});