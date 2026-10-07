# Question Classification & Provenance Audit Report

**Date of Execution:** 2026-10-07T15:26:04.989Z  
**Target Database:** Remote Supabase (`public.questions`)  
**Total Existing Questions:** 480  

---

## 1. Executive Summary

Prior to applying Migration 027 (`027_question_intelligence_and_spaced_repetition.sql`), all 480 existing rows in the remote database were evaluated against the repository's curated question banks, institutional seed definitions, student document extractions, and metadata records.

Defaulting all existing questions to `source_type = 'VERIFIED_CORE'` and `verified = true` would have incorrectly promoted unverified, duplicated, and test-run questions into official verified student practice material.

### Classification Breakdown

| Source Category | Count | Percentage | Provenance & Evidence Basis |
| :--- | :--- | :--- | :--- |
| **VERIFIED_CORE** | **370** | 77.1% | 100% exact normalized hash match with the 370 curated repository questions in `server/src/data/*.ts`. |
| **INSTITUTIONAL** | **50** | 10.4% | Created by verified faculty accounts (`fac_ids 1-5`) for master college via `supabase/seed.sql` (Mock Technical, Logical, Verbal). |
| **PERSONAL** | **15** | 3.1% | Created by student account (`test_student_flow@aset.ac.in`), `visibility = 'private'`, `is_global = false`, exactly matching personal document PDF extraction. |
| **AI_GENERATED** | **0** | 0.0% | No existing questions contain explicit AI generation metadata or provider tags. |
| **UNKNOWN / UNCLASSIFIED** | **45** | 9.4% | Duplicate automated test run questions created under super_admin account during RLS test runs without student ownership or direct FK. |
| **TOTAL** | **480** | 100.0% | Complete inventory audited. |

---

## 2. Duplicate Analysis

### Exact Duplicates
- **Total Duplicate Instances (Redundant Rows):** 45
- **Distinct Duplicate Content Groups:** 15

All 15 exact duplicate groups originate from repetitive test runs of the 15 personal document aptitude questions (1 created by student, 3 runs created under admin fallback).

| Sample Question Statement | Total Rows in DB | Question IDs |
| :--- | :--- | :--- |
| "What is the LCM of 12 and 18?..." | 4 | `80d12278-3533-474f-a127-ecbf6f8cff19`, `1073a7e1-6242-4718-bb2f-e6182e6884ce`, `7b18725b-be47-47e8-a804-f085ec9c29a8`, `454bcc06-8840-4f23-bcf2-5d4f5cac076f` |
| "What is the HCF of 36 and 48?..." | 4 | `1643e2fd-ccba-4b05-82f1-f6a67d74fa79`, `5f7a3438-f151-4c82-954f-be74fdcde332`, `2c620807-626c-44ad-9121-7da71f6abef0`, `8c81fde8-957a-4ef5-b298-c82c5b155af2` |
| "A student's marks increase from 60 to 75. What is ..." | 4 | `bcf39d15-7362-4025-bc0f-9003ba767fdc`, `41a0f7e6-3801-43a3-bf50-e784c6cc7ea7`, `90459d45-899f-4681-ab5d-cc2d75f61ab7`, `8161a75a-ebf3-414c-a768-36d585e6427d` |
| "A number is increased by 20% and then decreased by..." | 4 | `4e781712-9079-4530-b764-391950876f9b`, `c7e74f0b-b256-419a-94f3-e4da2c45e870`, `b151f8c9-19a3-40e5-be99-aaa1993273bc`, `135d018c-5e50-406c-bf8a-8924b2b74b9b` |
| "An article costs n800 and is sold for n920. What i..." | 4 | `06f4ed6b-237c-4e6f-81c7-bbd7db4929f7`, `bd8fd791-6832-4d96-83e3-653674834776`, `3a123969-8d59-48e2-9e3f-7719144d36be`, `16039552-8a21-404b-a819-7b7151f9e657` |
| "A shopkeeper gives a 10% discount on an item marke..." | 4 | `273ce702-0570-4507-beb4-56f9fac96a92`, `5610abfb-08f7-4a4d-8f5d-772e909605a4`, `a837ebfd-ba57-46c2-8bcf-0b79b1edd336`, `5f7af56a-f879-4236-a1e0-7b1f4420ecc8` |
| "The ratio of boys to girls is 3:2. If there are 30..." | 4 | `66f7b224-1035-4eb3-ab87-544fc3f34099`, `64c95739-b176-4dcb-8210-753328658dc7`, `7deb4471-d818-4543-857e-77e800f22188`, `ce4a72c2-2653-4dd1-abe8-2997d1ee13b9` |
| "The average of 5 numbers is 24. What is their tota..." | 4 | `708cc35b-3a9e-4200-92d0-493a54208fc8`, `5e5e1265-ce8c-4b0d-9ed9-af315bcc95d4`, `cb3d03c0-6229-44a5-9d00-042234e37852`, `163f75c2-117d-4179-b4a6-a69fb0dfe423` |
| "The average age of 4 students is 18. With a fifth ..." | 4 | `7fc76b27-2d9b-463a-8752-65967ebd63ca`, `67266079-8743-4135-ac30-3acf98d2ab88`, `78187e88-7302-4a4d-86c1-65795bbb428b`, `a166fe1d-7e47-470f-9644-4ea87fce72cf` |
| "A can complete a job in 10 days and B in 15 days. ..." | 4 | `640ecf0f-b3d9-4600-9cb7-54ef74ebbebf`, `4c48e814-39c6-4387-bdd7-4be7b0099f36`, `7b7cf63f-8c8d-4b84-802c-199a23a83e7b`, `8c871dec-5db9-4116-89a3-77fb29395345` |
| "A worker completes 1/4 of a job in 3 days. How man..." | 4 | `2265ef6f-f578-4f87-99dc-11170a7a07c7`, `a4aa5f7e-1e39-4e6d-a544-098893d27413`, `9ff07fd6-7f6c-4d71-864c-514c94e5a24e`, `74904313-3f6c-4393-92f0-45a693dcc740` |
| "A car travels 180 km in 3 hours. What is its avera..." | 4 | `05b19521-8c75-40b9-8cde-24fe4786d625`, `0732b225-dec6-4f6b-8fcd-6cd0ad2e5fae`, `d09acd64-e146-4a1a-88d5-caee970844ee`, `901f6332-9d2b-4db8-ae7f-3b48d111288d` |
| "A train travels at 72 km/h. How far in 25 minutes?..." | 4 | `882b2378-8adb-4920-9604-fcea09a58b46`, `04202b72-6b98-4705-baa1-4152c52c5269`, `9dec45de-8c42-4fe4-b941-2d8f893f9214`, `46ad2d79-d298-4f82-a3de-e5801dc39eca` |
| "Find SI on n5,000 at 8% per annum for 2 years...." | 4 | `d27c8bb4-ee57-46e2-bc91-9b53850ee669`, `0e72e3a6-1429-49ff-a2ad-ac358367a443`, `1acc49d2-8fe9-48a1-b819-e3a39204a98b`, `1e39e7e5-5d59-46a9-a9bc-a63d63bccc64` |
| "What is the amount on n10,000 at 10% compound inte..." | 4 | `744d1ec0-15a0-4fdd-8eb1-652f3109939e`, `8b7edf29-d321-4881-bf31-ad15a24a229c`, `cd2e0126-d38e-44d3-abeb-d64d1ed1f863`, `89e684d3-0c4e-4816-803b-a8cb26327dcc` |

### Near Duplicates
- **Questions with Near-Duplicate Matches (Similarity ≥ 0.85):** 52
- **Question `41a68375-404a-41f8-ba57-091e58723852`**: matched `39fd6b74-21b8-48df-9c02-8d62d2479fde (100%), 11dd3c29-6bb3-4841-9167-0e8b5beea936 (100%), a78eec66-538e-4ee7-81f3-2dc2eb70a6f5 (100%), 0130f125-3b14-4953-b715-b2665eb88aef (100%), e32fc3dc-f166-4d55-8964-0d23239315e4 (100%), 9afa8fa2-fbcb-48eb-95f1-48bf0109ea58 (100%), f24d3a8a-baf8-485d-987e-27f96f01302e (100%), 660b715e-fabb-49c8-aec1-9b4b829a6c30 (100%), afe7f167-97de-4eea-ab59-6caf09615cc5 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`
- **Question `39fd6b74-21b8-48df-9c02-8d62d2479fde`**: matched `41a68375-404a-41f8-ba57-091e58723852 (100%), 11dd3c29-6bb3-4841-9167-0e8b5beea936 (100%), a78eec66-538e-4ee7-81f3-2dc2eb70a6f5 (100%), 0130f125-3b14-4953-b715-b2665eb88aef (100%), e32fc3dc-f166-4d55-8964-0d23239315e4 (100%), 9afa8fa2-fbcb-48eb-95f1-48bf0109ea58 (100%), f24d3a8a-baf8-485d-987e-27f96f01302e (100%), 660b715e-fabb-49c8-aec1-9b4b829a6c30 (100%), afe7f167-97de-4eea-ab59-6caf09615cc5 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`
- **Question `11dd3c29-6bb3-4841-9167-0e8b5beea936`**: matched `41a68375-404a-41f8-ba57-091e58723852 (100%), 39fd6b74-21b8-48df-9c02-8d62d2479fde (100%), a78eec66-538e-4ee7-81f3-2dc2eb70a6f5 (100%), 0130f125-3b14-4953-b715-b2665eb88aef (100%), e32fc3dc-f166-4d55-8964-0d23239315e4 (100%), 9afa8fa2-fbcb-48eb-95f1-48bf0109ea58 (100%), f24d3a8a-baf8-485d-987e-27f96f01302e (100%), 660b715e-fabb-49c8-aec1-9b4b829a6c30 (100%), afe7f167-97de-4eea-ab59-6caf09615cc5 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`
- **Question `a78eec66-538e-4ee7-81f3-2dc2eb70a6f5`**: matched `41a68375-404a-41f8-ba57-091e58723852 (100%), 39fd6b74-21b8-48df-9c02-8d62d2479fde (100%), 11dd3c29-6bb3-4841-9167-0e8b5beea936 (100%), 0130f125-3b14-4953-b715-b2665eb88aef (100%), e32fc3dc-f166-4d55-8964-0d23239315e4 (100%), 9afa8fa2-fbcb-48eb-95f1-48bf0109ea58 (100%), f24d3a8a-baf8-485d-987e-27f96f01302e (100%), 660b715e-fabb-49c8-aec1-9b4b829a6c30 (100%), afe7f167-97de-4eea-ab59-6caf09615cc5 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`
- **Question `0130f125-3b14-4953-b715-b2665eb88aef`**: matched `41a68375-404a-41f8-ba57-091e58723852 (100%), 39fd6b74-21b8-48df-9c02-8d62d2479fde (100%), 11dd3c29-6bb3-4841-9167-0e8b5beea936 (100%), a78eec66-538e-4ee7-81f3-2dc2eb70a6f5 (100%), e32fc3dc-f166-4d55-8964-0d23239315e4 (100%), 9afa8fa2-fbcb-48eb-95f1-48bf0109ea58 (100%), f24d3a8a-baf8-485d-987e-27f96f01302e (100%), 660b715e-fabb-49c8-aec1-9b4b829a6c30 (100%), afe7f167-97de-4eea-ab59-6caf09615cc5 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`
- **Question `e32fc3dc-f166-4d55-8964-0d23239315e4`**: matched `41a68375-404a-41f8-ba57-091e58723852 (100%), 39fd6b74-21b8-48df-9c02-8d62d2479fde (100%), 11dd3c29-6bb3-4841-9167-0e8b5beea936 (100%), a78eec66-538e-4ee7-81f3-2dc2eb70a6f5 (100%), 0130f125-3b14-4953-b715-b2665eb88aef (100%), 9afa8fa2-fbcb-48eb-95f1-48bf0109ea58 (100%), f24d3a8a-baf8-485d-987e-27f96f01302e (100%), 660b715e-fabb-49c8-aec1-9b4b829a6c30 (100%), afe7f167-97de-4eea-ab59-6caf09615cc5 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`
- **Question `9afa8fa2-fbcb-48eb-95f1-48bf0109ea58`**: matched `41a68375-404a-41f8-ba57-091e58723852 (100%), 39fd6b74-21b8-48df-9c02-8d62d2479fde (100%), 11dd3c29-6bb3-4841-9167-0e8b5beea936 (100%), a78eec66-538e-4ee7-81f3-2dc2eb70a6f5 (100%), 0130f125-3b14-4953-b715-b2665eb88aef (100%), e32fc3dc-f166-4d55-8964-0d23239315e4 (100%), f24d3a8a-baf8-485d-987e-27f96f01302e (100%), 660b715e-fabb-49c8-aec1-9b4b829a6c30 (100%), afe7f167-97de-4eea-ab59-6caf09615cc5 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`
- **Question `f24d3a8a-baf8-485d-987e-27f96f01302e`**: matched `41a68375-404a-41f8-ba57-091e58723852 (100%), 39fd6b74-21b8-48df-9c02-8d62d2479fde (100%), 11dd3c29-6bb3-4841-9167-0e8b5beea936 (100%), a78eec66-538e-4ee7-81f3-2dc2eb70a6f5 (100%), 0130f125-3b14-4953-b715-b2665eb88aef (100%), e32fc3dc-f166-4d55-8964-0d23239315e4 (100%), 9afa8fa2-fbcb-48eb-95f1-48bf0109ea58 (100%), 660b715e-fabb-49c8-aec1-9b4b829a6c30 (100%), afe7f167-97de-4eea-ab59-6caf09615cc5 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`
- **Question `660b715e-fabb-49c8-aec1-9b4b829a6c30`**: matched `41a68375-404a-41f8-ba57-091e58723852 (100%), 39fd6b74-21b8-48df-9c02-8d62d2479fde (100%), 11dd3c29-6bb3-4841-9167-0e8b5beea936 (100%), a78eec66-538e-4ee7-81f3-2dc2eb70a6f5 (100%), 0130f125-3b14-4953-b715-b2665eb88aef (100%), e32fc3dc-f166-4d55-8964-0d23239315e4 (100%), 9afa8fa2-fbcb-48eb-95f1-48bf0109ea58 (100%), f24d3a8a-baf8-485d-987e-27f96f01302e (100%), afe7f167-97de-4eea-ab59-6caf09615cc5 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`
- **Question `afe7f167-97de-4eea-ab59-6caf09615cc5`**: matched `41a68375-404a-41f8-ba57-091e58723852 (100%), 39fd6b74-21b8-48df-9c02-8d62d2479fde (100%), 11dd3c29-6bb3-4841-9167-0e8b5beea936 (100%), a78eec66-538e-4ee7-81f3-2dc2eb70a6f5 (100%), 0130f125-3b14-4953-b715-b2665eb88aef (100%), e32fc3dc-f166-4d55-8964-0d23239315e4 (100%), 9afa8fa2-fbcb-48eb-95f1-48bf0109ea58 (100%), f24d3a8a-baf8-485d-987e-27f96f01302e (100%), 660b715e-fabb-49c8-aec1-9b4b829a6c30 (100%), 41121dea-becc-44d9-b366-0dc02514af9b (100%), 5c6f27a8-4a2b-41fa-9b21-1659701998ae (100%), 21f876e4-0b6c-40c4-8e95-3f8aad6f612c (100%), a56299ec-8876-4bd7-b47a-f15b3a04b273 (100%), d2365ccf-40f0-4d13-9a80-73c21c7a5326 (100%)`

---

## 3. UNKNOWN / Unclassified Questions (45 Questions)

These questions cannot be confidently classified as verified core or institutional. They must default to `source_type = 'UNKNOWN'`, `verified = false`, and `status = 'review'`.

| # | Question ID | Created At | Created By | Preview | Classification Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `1643e2fd-ccba-4b05-82f1-f6a67d74fa79` | 2026-10-06 | `00000000...` | What is the HCF of 36 and 48?... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 2 | `1073a7e1-6242-4718-bb2f-e6182e6884ce` | 2026-10-06 | `00000000...` | What is the LCM of 12 and 18?... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 3 | `41a0f7e6-3801-43a3-bf50-e784c6cc7ea7` | 2026-10-06 | `00000000...` | A student's marks increase from 60 to 75... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 4 | `c7e74f0b-b256-419a-94f3-e4da2c45e870` | 2026-10-06 | `00000000...` | A number is increased by 20% and then de... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 5 | `bd8fd791-6832-4d96-83e3-653674834776` | 2026-10-06 | `00000000...` | An article costs n800 and is sold for n9... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 6 | `5610abfb-08f7-4a4d-8f5d-772e909605a4` | 2026-10-06 | `00000000...` | A shopkeeper gives a 10% discount on an ... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 7 | `64c95739-b176-4dcb-8210-753328658dc7` | 2026-10-06 | `00000000...` | The ratio of boys to girls is 3:2. If th... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 8 | `5e5e1265-ce8c-4b0d-9ed9-af315bcc95d4` | 2026-10-06 | `00000000...` | The average of 5 numbers is 24. What is ... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 9 | `67266079-8743-4135-ac30-3acf98d2ab88` | 2026-10-06 | `00000000...` | The average age of 4 students is 18. Wit... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 10 | `4c48e814-39c6-4387-bdd7-4be7b0099f36` | 2026-10-06 | `00000000...` | A can complete a job in 10 days and B in... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 11 | `a4aa5f7e-1e39-4e6d-a544-098893d27413` | 2026-10-06 | `00000000...` | A worker completes 1/4 of a job in 3 day... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 12 | `0732b225-dec6-4f6b-8fcd-6cd0ad2e5fae` | 2026-10-06 | `00000000...` | A car travels 180 km in 3 hours. What is... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 13 | `04202b72-6b98-4705-baa1-4152c52c5269` | 2026-10-06 | `00000000...` | A train travels at 72 km/h. How far in 2... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 14 | `0e72e3a6-1429-49ff-a2ad-ac358367a443` | 2026-10-06 | `00000000...` | Find SI on n5,000 at 8% per annum for 2 ... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 15 | `8b7edf29-d321-4881-bf31-ad15a24a229c` | 2026-10-06 | `00000000...` | What is the amount on n10,000 at 10% com... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 16 | `2c620807-626c-44ad-9121-7da71f6abef0` | 2026-10-06 | `00000000...` | What is the HCF of 36 and 48?... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 17 | `7b18725b-be47-47e8-a804-f085ec9c29a8` | 2026-10-06 | `00000000...` | What is the LCM of 12 and 18?... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 18 | `90459d45-899f-4681-ab5d-cc2d75f61ab7` | 2026-10-06 | `00000000...` | A student's marks increase from 60 to 75... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 19 | `b151f8c9-19a3-40e5-be99-aaa1993273bc` | 2026-10-06 | `00000000...` | A number is increased by 20% and then de... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 20 | `3a123969-8d59-48e2-9e3f-7719144d36be` | 2026-10-06 | `00000000...` | An article costs n800 and is sold for n9... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 21 | `a837ebfd-ba57-46c2-8bcf-0b79b1edd336` | 2026-10-06 | `00000000...` | A shopkeeper gives a 10% discount on an ... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 22 | `7deb4471-d818-4543-857e-77e800f22188` | 2026-10-06 | `00000000...` | The ratio of boys to girls is 3:2. If th... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 23 | `cb3d03c0-6229-44a5-9d00-042234e37852` | 2026-10-06 | `00000000...` | The average of 5 numbers is 24. What is ... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 24 | `78187e88-7302-4a4d-86c1-65795bbb428b` | 2026-10-06 | `00000000...` | The average age of 4 students is 18. Wit... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 25 | `7b7cf63f-8c8d-4b84-802c-199a23a83e7b` | 2026-10-06 | `00000000...` | A can complete a job in 10 days and B in... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 26 | `9ff07fd6-7f6c-4d71-864c-514c94e5a24e` | 2026-10-06 | `00000000...` | A worker completes 1/4 of a job in 3 day... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 27 | `d09acd64-e146-4a1a-88d5-caee970844ee` | 2026-10-06 | `00000000...` | A car travels 180 km in 3 hours. What is... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 28 | `9dec45de-8c42-4fe4-b941-2d8f893f9214` | 2026-10-06 | `00000000...` | A train travels at 72 km/h. How far in 2... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 29 | `1acc49d2-8fe9-48a1-b819-e3a39204a98b` | 2026-10-06 | `00000000...` | Find SI on n5,000 at 8% per annum for 2 ... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 30 | `cd2e0126-d38e-44d3-abeb-d64d1ed1f863` | 2026-10-06 | `00000000...` | What is the amount on n10,000 at 10% com... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 31 | `8161a75a-ebf3-414c-a768-36d585e6427d` | 2026-10-06 | `00000000...` | A student's marks increase from 60 to 75... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 32 | `135d018c-5e50-406c-bf8a-8924b2b74b9b` | 2026-10-06 | `00000000...` | A number is increased by 20% and then de... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 33 | `16039552-8a21-404b-a819-7b7151f9e657` | 2026-10-06 | `00000000...` | An article costs n800 and is sold for n9... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 34 | `5f7af56a-f879-4236-a1e0-7b1f4420ecc8` | 2026-10-06 | `00000000...` | A shopkeeper gives a 10% discount on an ... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 35 | `ce4a72c2-2653-4dd1-abe8-2997d1ee13b9` | 2026-10-06 | `00000000...` | The ratio of boys to girls is 3:2. If th... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 36 | `163f75c2-117d-4179-b4a6-a69fb0dfe423` | 2026-10-06 | `00000000...` | The average of 5 numbers is 24. What is ... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 37 | `a166fe1d-7e47-470f-9644-4ea87fce72cf` | 2026-10-06 | `00000000...` | The average age of 4 students is 18. Wit... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 38 | `8c871dec-5db9-4116-89a3-77fb29395345` | 2026-10-06 | `00000000...` | A can complete a job in 10 days and B in... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 39 | `74904313-3f6c-4393-92f0-45a693dcc740` | 2026-10-06 | `00000000...` | A worker completes 1/4 of a job in 3 day... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 40 | `901f6332-9d2b-4db8-ae7f-3b48d111288d` | 2026-10-06 | `00000000...` | A car travels 180 km in 3 hours. What is... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 41 | `46ad2d79-d298-4f82-a3de-e5801dc39eca` | 2026-10-06 | `00000000...` | A train travels at 72 km/h. How far in 2... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 42 | `1e39e7e5-5d59-46a9-a9bc-a63d63bccc64` | 2026-10-06 | `00000000...` | Find SI on n5,000 at 8% per annum for 2 ... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 43 | `89e684d3-0c4e-4816-803b-a8cb26327dcc` | 2026-10-06 | `00000000...` | What is the amount on n10,000 at 10% com... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 44 | `8c81fde8-957a-4ef5-b298-c82c5b155af2` | 2026-10-06 | `00000000...` | What is the HCF of 36 and 48?... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |
| 45 | `454bcc06-8840-4f23-bcf2-5d4f5cac076f` | 2026-10-06 | `00000000...` | What is the LCM of 12 and 18?... | Duplicate statement of personal document test question, but created by user 00000000-0000-0000-0000-000000000001 (super_admin) rather than student owner. Lacks direct personal document foreign key. |

### Complete List of UNKNOWN Question IDs
```json
[
  "1643e2fd-ccba-4b05-82f1-f6a67d74fa79",
  "1073a7e1-6242-4718-bb2f-e6182e6884ce",
  "41a0f7e6-3801-43a3-bf50-e784c6cc7ea7",
  "c7e74f0b-b256-419a-94f3-e4da2c45e870",
  "bd8fd791-6832-4d96-83e3-653674834776",
  "5610abfb-08f7-4a4d-8f5d-772e909605a4",
  "64c95739-b176-4dcb-8210-753328658dc7",
  "5e5e1265-ce8c-4b0d-9ed9-af315bcc95d4",
  "67266079-8743-4135-ac30-3acf98d2ab88",
  "4c48e814-39c6-4387-bdd7-4be7b0099f36",
  "a4aa5f7e-1e39-4e6d-a544-098893d27413",
  "0732b225-dec6-4f6b-8fcd-6cd0ad2e5fae",
  "04202b72-6b98-4705-baa1-4152c52c5269",
  "0e72e3a6-1429-49ff-a2ad-ac358367a443",
  "8b7edf29-d321-4881-bf31-ad15a24a229c",
  "2c620807-626c-44ad-9121-7da71f6abef0",
  "7b18725b-be47-47e8-a804-f085ec9c29a8",
  "90459d45-899f-4681-ab5d-cc2d75f61ab7",
  "b151f8c9-19a3-40e5-be99-aaa1993273bc",
  "3a123969-8d59-48e2-9e3f-7719144d36be",
  "a837ebfd-ba57-46c2-8bcf-0b79b1edd336",
  "7deb4471-d818-4543-857e-77e800f22188",
  "cb3d03c0-6229-44a5-9d00-042234e37852",
  "78187e88-7302-4a4d-86c1-65795bbb428b",
  "7b7cf63f-8c8d-4b84-802c-199a23a83e7b",
  "9ff07fd6-7f6c-4d71-864c-514c94e5a24e",
  "d09acd64-e146-4a1a-88d5-caee970844ee",
  "9dec45de-8c42-4fe4-b941-2d8f893f9214",
  "1acc49d2-8fe9-48a1-b819-e3a39204a98b",
  "cd2e0126-d38e-44d3-abeb-d64d1ed1f863",
  "8161a75a-ebf3-414c-a768-36d585e6427d",
  "135d018c-5e50-406c-bf8a-8924b2b74b9b",
  "16039552-8a21-404b-a819-7b7151f9e657",
  "5f7af56a-f879-4236-a1e0-7b1f4420ecc8",
  "ce4a72c2-2653-4dd1-abe8-2997d1ee13b9",
  "163f75c2-117d-4179-b4a6-a69fb0dfe423",
  "a166fe1d-7e47-470f-9644-4ea87fce72cf",
  "8c871dec-5db9-4116-89a3-77fb29395345",
  "74904313-3f6c-4393-92f0-45a693dcc740",
  "901f6332-9d2b-4db8-ae7f-3b48d111288d",
  "46ad2d79-d298-4f82-a3de-e5801dc39eca",
  "1e39e7e5-5d59-46a9-a9bc-a63d63bccc64",
  "89e684d3-0c4e-4816-803b-a8cb26327dcc",
  "8c81fde8-957a-4ef5-b298-c82c5b155af2",
  "454bcc06-8840-4f23-bcf2-5d4f5cac076f"
]
```

---

## 4. Migration 027 Safety Recommendations

1. **Avoid Universal `DEFAULT 'VERIFIED_CORE'`**:
   Migration 027 should NOT set `DEFAULT 'VERIFIED_CORE'` for existing rows.
   Existing rows should default to `'UNKNOWN'` or `NULL` (or be backfilled using this classification dataset).
2. **Set `verified DEFAULT false` for unclassified**:
   Questions should only be `verified = true` if they match `VERIFIED_CORE` or approved `INSTITUTIONAL`.
3. **Allow `source_type CHECK (source_type IN ('VERIFIED_CORE', 'INSTITUTIONAL', 'AI_GENERATED', 'PERSONAL', 'UNKNOWN'))`**:
   Add `'UNKNOWN'` to the allowed ENUM / CHECK values to accommodate legacy questions cleanly.
