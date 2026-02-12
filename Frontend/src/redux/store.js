import { configureStore } from "@reduxjs/toolkit";
import clinicAdminReducer from "./clinicAdminSlice";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import patientReducer from "./patientSlice";
import caseSheetReducer from "./caseSheetSlice";
import procedureReducer from "./procedureSlice";
import billingReducer from "./billingSlice";
import imagingReducer from "./imagingSlice";
import reportReducer from "./reportSlice";
import appointmentReducer from "./appointmentSlice";
import prescriptionReducer from "./prescriptionSlice";
import illustrationReducer from "./illustrationSlice";
import roleReducer from "./roleSlice";


export const store = configureStore({
    reducer: {
        clinicAdmin: clinicAdminReducer,
        auth: authReducer,
        users: userReducer,
        patients: patientReducer,
        caseSheet: caseSheetReducer,
        prescriptions: prescriptionReducer,
        procedures: procedureReducer,
        billing: billingReducer,
        imaging: imagingReducer,
        reports: reportReducer,
        appointments: appointmentReducer,
        illustrations: illustrationReducer,
        roles: roleReducer

    }
});

export default store;
