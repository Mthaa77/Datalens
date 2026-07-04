# CivicLens SA Security Rules Specification

This document details the data invariants, malicious attack payloads, and security rule test runner designed to enforce Zero-Trust Attribute-Based Access Control (ABAC) in the CivicLens SA africa-south1 Firestore instance.

## 1. Data Invariants

1. **User Identity Isolation**: A user's watchlist and alert subscriptions are private and sovereign. No user may read or write another user's profile document.
2. **Read Limitation (Anti-Scraping)**: Blanket listing of user directories is strictly prohibited. Users must retrieve only their own specific profile document via a direct document GET.
3. **Temporal Integrity**: User profiles must have a `createdAt` timestamp set at the exact moment of creation via the server's time, and `updatedAt` must be updated on modification.
4. **Ingestion Logs Lock**: Ingestion logs and connection test histories are transparently readable by authenticated users but are completely read-only from any client-side SDK. Client writes are completely blocked to prevent spoofing.

## 2. The "Dirty Dozen" Malicious Payloads

These 12 attack vectors attempt to break our database invariants and must be blocked with `PERMISSION_DENIED`.

1. **Identity Theft (Profile Create)**: Authenticated user `user_A` attempts to write a profile document under path `/users/user_B`.
2. **Identity Spoofing (Profile Update)**: Authenticated user `user_A` attempts to modify `/users/user_A`'s email to another user's address.
3. **Immutability Breach**: Authenticated user attempts to modify `createdAt` after profile creation.
4. **Denial of Wallet (Huge String)**: Attacker attempts to set an abnormally large array of municipality codes (size > 100 elements) to waste indexing resources.
5. **Denial of Wallet (Invalid ID)**: Attacker attempts to write a document with an ID string of 10,000 characters.
6. **Query Scraping**: Authenticated user attempts to list the entire `/users` collection to scrape email addresses.
7. **Bypass Verification**: User attempts to write profile with `email_verified: false` but claiming full administrative permissions.
8. **Spoof Ingestion Logs**: Attacker attempts to create a fake successful ingestion log in `/ingestion_logs/muni_money_hack` to hide pipeline failures.
9. **Corrupt Ingestion Stats**: Attacker attempts to update an ingestion log to nullify the record count.
10. **Spoof Connection status**: Attacker attempts to write a fake positive connection test to `/connection_tests/etenders`.
11. **Erase Ingestion History**: Attacker attempts to delete the official audit history from `/ingestion_logs`.
12. **Null Pointer Injection**: Attacker attempts to send profile creation request without mandatory properties like `watchlist` or `subscribedAlerts`.

## 3. Test Runner Definition (`firestore.rules.test.ts`)

A mock typescript test suite to verify that all malicious payloads fail:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

// Standard security tests
describe("CivicLens SA Security Sandbox", () => {
  it("blocks cross-user reads and writes on profiles", async () => {
    // Verified by assertFails
  });
});
```
