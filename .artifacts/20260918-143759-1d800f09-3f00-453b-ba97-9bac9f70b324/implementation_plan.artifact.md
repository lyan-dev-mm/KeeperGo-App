# Form Verification and Fixes

Analyze and fix issues in the project's forms, focusing on imports, API connections, responses, and professional design.

## User Review Required

- **Password Validation**: The UI claims specific password requirements (uppercase, number, special character), but the current validator only checks for length. I plan to align the validator with the UI's stated requirements.

## Proposed Changes

### Registration and Location

#### [RegisterLocationScreen.jsx](file:///C:/Users/juand/OneDrive/Documentos/GitHub/KeeperGo-App/src/presentation/screens/RegisterLocationScreen.jsx)

- Add missing import for `LocationMap`.
- Fix logic bug in `handleConfirmLocation` where it checks `if (!markerCoordinate)` but then accesses its properties, leading to a crash if null.

```javascript
// Add import
import LocationMap from '../components/LocationMap';

// Fix handleConfirmLocation
const handleConfirmLocation = () => {
  if (markerCoordinate) { // Changed from !markerCoordinate
    Alert.alert(
      '¡Ubicación Guardada!',
      `Latitud: ${markerCoordinate.latitude.toFixed(4)}\nLongitud: ${markerCoordinate.longitude.toFixed(4)}`,
      [{ text: 'Excelente' }]
    );
  }
};
```

### Utils

#### [validators.ts](file:///C:/Users/juand/OneDrive/Documentos/GitHub/KeeperGo-App/src/utils/validators.ts)

- Update `validatePassword` to include regex for uppercase, number, and special character as indicated in the UI.

```typescript
  validatePassword(value: string): string | null {
    if (!value) return 'La contraseña es obligatoria';
    if (value.length < 8) return 'Mínimo 8 caracteres';

    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasUpperCase || !hasNumber || !hasSpecial) {
      return 'Debe tener una mayúscula, un número y un carácter especial';
    }
    return null;
  },
```

---

### Professional Profile

#### [ProfessionalProfileForm.tsx](file:///C:/Users/juand/OneDrive/Documentos/GitHub/KeeperGo-App/src/presentation/components/profile/ProfessionalProfileForm.tsx)

- Verified that it correctly connects to `datosNonStopService.verifyLicense`.
- Verified that it handles API responses (found, not found, error) and updates the form accordingly.
- Verified that the design is professional with multi-step support and image upload.

## Verification Plan

### Automated Tests
- Not applicable for this UI-heavy task, but I will use `analyze_file` to check for syntax errors after editing.

### Manual Verification
- Verify that `RegisterLocationScreen.jsx` no longer has missing import errors.
- Verify that `handleConfirmLocation` works correctly when a coordinate is selected.
- Verify that the password validator correctly rejects passwords missing the required characters.
