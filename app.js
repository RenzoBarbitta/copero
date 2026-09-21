// --- BADGES EN BASE64 ---
const BADGE_INMORTAL = "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";
const BADGE_MASTER = "iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAd+ElEQVR42u2ceZQd1X3nP79bt+rVW3pf1VJrR0KA2AwGYUCYGIyBhGAssSSOE2ediSeZJCf5Y86cAMmZnDmTsZOJnYTxmYxjJ9gZmMQhibExAYwxZjM7CKEFLa2lu9V7v9dvqbr3N3+86lYjYweBwGSiq3O76tWrV6r61u/726vg5Dg5To6T49/ukHfquPrevFj9t3xTTsQZyb+Ki70O2muFQr4VlDmg+edNj0q2LM5vKEBKQSxzzeMVCtmXzT1SVbHSFPpUVQBaRXR+e+7IEVkP9d9CJk60EMoJPpb2QOnjYp/pVb+0gaaAUZqn7bMddX7n7GfmmPMwR6cKSAAKKgEGi6hBMTgJAQsEQIhgEUKEIFtaDBa0O18ybStXTAwf2Hn2BbOz4wpyouhsTxR6myF4GNymILgide6UM22JFiMkKIE0IRIEI9JESwREMIBIc7tBMCoE8/tq9l0YYgoxUq0h3hO2txEuX0GQiwlaWzBxTBBajLXNfW2IhBYTWUwuwlqjjb/88rK9NX8V8OVvNTFP31MA9jbvqOa8vzkA7cCmLam3BiHGkMskJEAIgGAesEzaJNsu2bamUAqogSiEYjv05mD/EOwfg8F1cMnlEMVQLECch1wEUQQ2aE4R6GiFtUtS94U7bcHZmxDuvEwXyPC2R3Ci6LsN/FWlUk/caPzJBoniU9WaqqYSKNJQJ069JOokUS8NdVJXL/VsPVEvqTpJsv2cevGqgiIQirYXRQd7hJWDwimrRSemxb/8tBDlRS+5UHxoRXMhGoWi1oiGAWoDpJQXXdGPdHcZ3blTZp96fNllp6z+4hkTEzO3gnn4BNDYnkj6lubq17YhrWslSo1XGyLkMBSNxUhTAo2AKjTRadJ5XhoDIMAQiMGIQWwIpQL8zifhNz8FqVfGJ5Gde4S/+Ar80wNw2jr4dz8Pzgs2BGsUEzQ1bDGnoh6mytgPfyjt+/wXCqP7p38cuOMyMLfz9iXxhAB4GfiHQUXdLR0Ig2pJSQkRaijbgwRjBAWMNMkZZJp8XvFbadI7QohMgDWGKBBiXyP3t98geuk1JI7EpymuUqExV6XW18bc1/6Ryu5tVIGaehoBkriElStWc+Z/+X3V6aowU8GcukHiVasJd796M0buuMyrf0/owFuzO3lLHK+g1rh4qUSag6AORAjDqH4nKcsyDO2ZxIWwoAtDIIchQsghOAwOgyXA0CAIEoInXkKefAlrA9QpkiZ4GihKg4S5Hc8wCUwAk5n2fBkYvP4npWP1OvyRcaSt1cgHL9aW3S9uumdg9Vo5sHuXNu+n/5EC+K2mDfCukd7QCfFqidLEO6uAAw7iSBH2AS9mFxcATVcks8J4NSAiAngEsu8MRmuYIECCAIMgFtR4vHck3tHAU5OYOTwVlARYbUNqSZVXH3qQC5etQitzMDUr0aYL0/6/+GJ4ZHjio8B/mz/3HzWATgDxelMXAZ2ITJESIThUD5FKDngWzyMowSI/UI7xR7P4b/7rJrjzDmRyjMOZbdZFk8w3uQjldK+8eP/9XPip/6ASheihEbFdHZI/ZR3hjhe2ovqHl4m4t3v95u3SV0BvCMMzLbxvqYRaUWcmcdTxTOOZyyRqDKUAxEA+W+ay5eKZA8ll30UZxaOF2dSR8w70679rfo6BSefIScC+7z3F1JERzOUfQJf0wFTFBFddrm1wzpc6lp2Z2TPzI5PAeQqEqdnaCWaZscm4a4Q2k44pvOSASYSZZkRGDvk+30EWRSi6aJ3MUr9R0OMBz1GR9dlsALMozlgars4rf36HbPqZT6JtJRifkNyq1Wl31G47pqe2AM+/XRq/LQAfBrcZrIUbeiUgBFPD05ZdYAVPjHAERYEuAuIMkmNh0WNA1Ddw0fQY+vpsqwdSFAdUUWrApHpWAa888ACbnt2Nqafo9CzBaatNfMYG7DOPfHTzQ7fedtkHb3c/EgncAsHd4HptfH4h9acuMdaXfRqEmZFIEObP7BCeOLPCEUcjkDcKyP0xEqjHJFPmgZ2XQMXgUWpoM2xEmMZzRD1nEnBoeJiJ08+j85uP4StzaKVs7EVn+tZn7IYbf+Kz5wk8fhcEW8G9qzrwtOy6YsdNHQh9Eri6OnJZuNYAjYCpbLYgFBFiZEH/vdF8vW4U8tmc/938eh6hgFAACtmxo+xzDhhVj5gcbnqS7YGD9WugWECHh8khvqfUTWl29kaAnreRVHmrAMrtkG6GOFC9rksMFgKPZkpecKhY4CAeB5QyP++oITg6beYT2jecikEJsuX8epBZ9PnfHQVeKGGYRjkSoO3A9r27YOVSxGR+6P7DprBqOTHp9Z/YvCK+vGm85V0DcEv2u2VB4dIiumJJYF1DvcQIUTMcU5O5FIcyUIvIAijBMdNkYEh2QvPbBF2c2vq+ufgY8464zaTUA4c1lU4iRl7dwURvO1IsgI2RnftNvKTP9WBXnP745KUK3PUWsXhbJjzw/uZ20L4g9N47KWHIYXAgAcoYygRKIYs0gmMu3mRa7fXAaBYnvzFgx64vBjFetMwB+11CnMsTzUyxo1FRVg6Ctej0BHkx2lXs0vb63I2ZULxrFJa7wV3V2dlqVK/pDKzEQhCgxJkUpBkoQ3iSLG8cLlywLgJufn1e+o4F7uhnWQB2McDN9QDFZv9/lLGgBcOYKuMBLEfYvf1l4ZSVSNB05e3hUVNYsVTypNf+1Nq1rdI0IvKOA7i5eZOla7pxZQvasySOXeq9KWZK3WSORgIMZfQtZdQKFgHz/ZRcDNbifY5SWV439XWUtxlw+UxNtGY03uEaLDcl5l58hYm+dqS9FSEHew+ZYm+368H2nr1/+EpAbn0L6b3jBnA+cRr69KY2RHttqC5JaCGggMFn9BlBGUcz8JqeXbjIOJhFOm/xPLpNfsD219PWZomJ+cikhCEWIYfSgbAvrRPkS3TNjLNvegJWLAUbIjNTFI3RzmKHFhq1mwA9/S3kB81boe+WUqnHqF7RFUUSOw1y2tRzYSYvMYa9KClQQFmb+YAuk6RgEYg/TCLfCOTgDWaYTSsGxdOpcEncRo8Yppxnn/W6hhwHX3lFWbEUY0wzAz48FhSXDUiR9EM/19/fsxWcHieNzVuhb27OX1OC1qVRLtVGQ4oYcgBiiACHYQhPmIVvG7BcKhGrJcDj8Yt0mFnkjrzeMssPNBaL3Zwwi42dMdS0wTIT8qmN7+eXV55GrzZp/FxSoT1op/HiK0x2tUDc1NZm/7C09ve6Jdi29eMzVwNy23HS+LgAvCxLgASqN7cg9JoAbSSUMIRiSE1TDx5AmcwAbBPDGWHMWoWLTcQFYZ4IJcFjjtGNwTGW1vwLlthmxakaStHXuXLVBn7nozdz5p9+hvylF+gpGEKEnfWqzBQiOqfGZH91Bvp7mwFleZqSsdpe7CSfNG4G9LbjjIuPB0BzO/hr43i5Vb2kM7TknQ9yWSRgbUgqEGLYQUoKhCi9UcgqG7OKkJUONmnATxTaWGkClBSVo8nV73dTFqf6vx/I1BhUG5xuDL/4E1u55Zd/hdZf+TnSS85Xu3YVG6IWSmKYco7tQcJSLCO7dqNrlyPUERQ7PBYUlg9QJL30Fzo7lwn4W48Dlze94/xBu1L5yRY0PxjlUtNIpZWAPAbNWXCeCZS9WT4wh7LexlpIlQhDPxHdKayve7a0dnNJoY2iehoyrxuPVu3MIpoGC0BmdRWE1AidvsFH+lfw85/6Dc648GK0twe/pAezcy/a0yVrWjvoEIMCLzQqlII2ai++wtTy3oXqMUOHpb27O+3D5gdnqj95vLgcjwR6AOPYWgT6AyuSpLRiCK2lIiDq2EnCBD6LbYVOL4gezbG0YWl3Qt9MlWtbu/lo3yDrVXB4VJr+3Dxwcgy1Q7RZacdzpvfcfOFl/Pj1W+gYnsYPHULyMbJrH2bosMiqFcTFAl3atP676nMcKUbEE8MMuRr0DyB4pDxDrCqtxTYKaePGY3IaJ6asOV/32BK1rC849wcrwlDWGitxkkonBi3kGXYNXJryKAnDeHIIHQgjaV2GLWwwOfDNSkZMQKgGU64w0NrCquXLyU2UOexrVExAmGU5w0UnGQCJEVo15UNxB1f++HWsLXUSPPUSWq1iVi5DqzVEFY0Ctv3Jn7D92SeZQRhTpayeFXFee+o1OdRSZH3/MtizAwdonJdKa5GR8eGBwZaWv/l0ozH+Zsue5ngkteDd9S1gB6MoDRqptDRbLahEAY16nQmUQ7iFJEE+c3C/1SjzWWY5nDOEAo2mvCFicIdH6Rub5MMXb+KmrhWc4lPKRqhnEjvvGCcG1vmEmwbXcfl119K76zD+m4+iY5OgDh0ZQUbHmNm5ncd/9Vd5+d57qDtDt2/G4QAv1MtSNCWqL2xjamkzO2kI8QdHpLOrwy0hCPuryQ3Hg82b2um2LMyxTrYUgF5jTZg4SjTbLqZwiHfsE880mmVdYHcWkQwQsCep8bl0mufyAcUwRPGk6kEs6eg48bMvcc7lF/PxTVdwlRcCMVQEygIOzwe852OXXMnGCy8g/80n0G2vIV7RtIGEBkkbbH/+Se77zKfZe3CIQtBKFeVJUi1lhm5Xo6oz+Qg7Ocr+Rhl6lzQpWJmh4FTaiu3k02Qritz2JvOD5s3QV0BvCosbI/Vnd1irxdSbOMuAJHHITLVGAuzWlCTL1zUQ9qI8gGMWWEKAc44v1cb5u3xKWChQwKCqICHpzBx89T56Vy/nmk/+ErdQpFeFNk24Pt/KtZ/8JZa2lDB3fwOdKqNGcUYxA11UrXL/49/m/kceYFyFksSMuIQvUOfbpAJCK4Zx72WXb9AG7HttF5yyPGtAEhibMMX+Hi3izvr3xcJZAvpmrLF5syDnvd9SRM1gGKa5pJl5CRCmAqjX6oxnmWe7KMc3SEAC3E/KAaAfS7s3PDgzwZ8xzURbnpKJMKp4MTScx915J/mREc77vf/ETV1LuXnlqWz6rV+n9NwL+Hu/gRODIwXvsW1FDqRz/O1T32XbgX1YE9MGPK0NPkuVYTznYiliiLMwc3ujSp48wzt2MFVsnmmemODwhHS2t7kuAtNWd1vfLD7/ohF5GHQz2F6iz7VB9zlxTHstMa0IYi1DVqnXa+xA2YEjxtAE1xBnecAUeAWHAKsICDEcTGo8TY2ujlYGNcIkDi9AkEdefREZHaP7tz9F3+rV8L/+kmTnLpKghcSnRFhMS4HHpcIDB/dSS1NKEhEpPEjKvSSUEN5HyAABjaxGXUOZwXOuLTA1N0U00M/AkTk0bZCkVbSnk/HpsowltV7drHf85T7c7W8HwC0QbAN/gY03tXj9nYHQ+o0mDFoSRxFDPbLsT2qkzvMkKRNAOwG5ZgkcyVyZJqDKDpp+4iCGAoayS3iiNkujo8CpuSK2WqeuDhfE1Ef24R96Ev/wY9Rnp0iDIolLKElItTXmq36aZ6fGiTC0EFBF+XsSnsaxGsM5hBQxVFHKKI3MkZrCs9yEtPuUQ7mAs2wRPztFHY+3ocwVIj8xO9UTjcT3XZ2mQxkG+pYoPF/3yDu2RHiWhaErJs0CUYAwEwiVJGUIzwH8QlbYZDFqhMFmYA1gWYPlMJ6vkzKF0oIl9sI/jh7ij3WK8f5WTCCUXZUkKJJUK9RcQsPENFyDYhixrz3if9aP8GJ5ioiAlizu/t/U2YXjLCxnEGEQKiiVhQJXs3EuBV72ddrJMX7oMCMxOBTBko5P0l0q+U4MxUS3LsbgrUigPAx+M8SdYj5XhPb3h3nprqdSwhAGlv3iqKc1psSwn5QChiLB0S6rRSkpm4FbwFDGsyOr1PVlOZf9tQrPujpLertZ4gWt18lJrvl7TSmVWngqL3x5ZpRyktCCpYThWRz30MAC5xMyiCXJ6sNJ5hEvLoU2UCbVcZaJmWpUyLe2sKySMucd1bRO1NnOeHlOjqT1/kNr9Y6vTpD8sERr8C/QV98f5C4teP9r/UHgL5ScFJwTJ8KcePo62lgeFjijlrJGIqZxzKEEmIWcniwCcb77Ko/BoezCUQeWYghEmEwaPF2ZJervYmOpHTtTJgosDPTwNa3wjcnRZtcaAQHCt0l5lJQBDOcT0YahkZU704XWD83Sr6A4OoHN5NmoljPbejHFPJMzM4QqgMMFgST50I9VZjuKldyDzzq394fR+AcCeDqYbaDnIr/Xgjv9NJvX9U6C17RBGSVWKNUS4oEego52BifnWEdM2SgT6rKIVRb1mjY/2dd1rDbT/qMoS7JtdfU8Nz3J4fYCG9etpdzZwlfGDvD85BhhJnUV4J9J2YNnAwEbiQhoOt/zbTQOzf41QRRSVovlBlq4jCJ9y5Yw2hLw3NAehpM64+KZQymlQpKP3WxlVhMv5hHc398G5u4fAKD9IfpPAcr4nhSCv0vKSY2YD0hAop6IEOsssvswwYp+3Dnr6Nt2kFvqOR6KGjzRmKW+0IYhC5cBkEPpIljQmQdwfBvHRgxtGBDloaEhjpQrLKk79s1NE0pIrHAQ5VFSPHA2AUsJSBaAOip1izsccqRcYFu4Mi3Smc+TLGvjxelR9hwYpoohwjCjKQUb8zANfWR0UrvBOrSPZqucHjeFH86MzCh6TyCyGvTMF0idEyMX2LyUvGIJCEwOpqYRD3r+emyqrJl19JZaGEtqVNUt2KqjtrlJ58V9gVU8e/AIQhuQCMxWq5SSlFQsgcKLeB6nGQFtxLIUm9Wg57sUeF3XAjh6BK6PuviIa6F1aQ/J6k6e37+b0Ylx8hIxk/1yRVDgKeP9N5OypqgdEu78irqfvRXS298KgPOjCvUD8H/7RYISctluUtlncWd1dZuOxNFIq5ggh5SrmCOz6EWnoUt76R0ps6a1g7JzTKfVBSKbRXSWLJqxmW70wAE8c0ArIGLoIWAO5bt4XsWzDMO6jMppdlNsVoP2C1KohKScFuT4advL2aaInD5I0mbZ88JLlOeqeLFMqqOI0CMx92rdPeVqQYCYsjG3PaD660Dj4de37rylbIxsgeA+eLDHmNdKcNW0S6KnfS1duXalGZCItDyJmBzUPfLaMLJxFf78UymOzrAhbiGXizhSKdPIuq3mk6XzdUR7THFoHGUM6MzO/CE8kyirMAxmulKzm5EsgKc4BI+nhONDcSdbpYO+7m782Stxk2NMvrCdmmtGPXV19BOQSshXtJruJ7UGqcwY+cTD3v9pZjh+KHhvOp21LYtGvqP6XCf8c0nMh2ySdj41NZ6UTltr1nYtEYbH0UIeyefhlf1IHKE3XonxMHhohr5CkfFahTl1aOZwFxHKC6DOZ56boeBcBuLuTHOuwdCFEGbu0bENSQ5ISekV4ZaelVxe7CXcfB5sXEn63Scp7ztIQ0KqWZl0kIjnUf6KubSOWidm92Ror3nMufs3g733TSYT3nQBZV/TJ7SPwlAP+btC4bwWx+oXDu53teV9suH0DRIcOIK3AdLVDsMTSLkKV2zCRyFdOw5wiomp+JRJn+BRugkwWRvc4q7V+SeP6ihtCOux9GT1jcUFJzIJTPCkpGyMivxi3xrWBDFJfyu+pwP5p28jE1MkJmRWU3JACyF3UdN/oOYixNZEHhhWvfoZ73dtBvvwcTyEc1wVqH3gt0DwdZKZV/B3rhK7pEOi8/Ye3KeHLLr2ovMkPzqNn5pF2kqwfADOPQs5/0z82uXkX93L+jmHNYaDrs4kjkKm/6pZte5oH6DSiaEHQ2khHGxemWb6soHSwBPiuaLUzdbWAWZrVWZLAaOVKfY89h2m6nUSsdTV045hEuGPKPunSYiRYEb48wdVbxmB8hYI7j3ONrfjrsRnDqVR8Ftx/7DamJmi5D9cHhsxu0ZH3MAH3mfagxC/fxhSB5s3wSUXYQb60AvPxuw7wPLDU/TbHEOuxmjzQshnElfPfLgcQkvmkDuaj4wlC3Sd/+zoErgu6mJTPccBqpjuIq9Nj7F7+DBqcgyTsldrtCHswPOHzLoRfBAgMo38x0fQ31Xg9qbfe9ydqm/1SSW9HWQz2K+p++4Kw/dyJr7KVGrFXTt3pi1nn2r6V66AXUMwNgmXvh9Zv05pbxcu24SOHaFrx37WScywr7GbWuZgCyl+IQxzmeOtmbS5DLwUcKSsEsvHaOdUp5gzVjO4cimVnXs4ODOFiGVaHSnKKUQ8hde/YC5NwTpkbAbzscfwf70Z7M+9vrv4XQFwgdK3gv0zda8OKP8YmfDiog8G9u54JfW9HbL8/eeIvLwbyhXktLUifb0qvd1w5WZRIxRe2sGZjYBEnb5MVeYlz2dS6Ba18vqMvs3uhpQLTYHrtciAWNpuupr2tcvhwWeplsuEEjCrKUWENcR8g0TvpZbmkHAOeX6c8OpnSB8/Xn13wgHMHG6/Gex9uFGrjTtbJFhXCvJnDO/b7afrdRm89AIJH38efeQpZGJSeG2/yPgU8qFL8OedQbB7D6eO16TLCa9QpZIlZefFwWXuThNMRxvKtaadK7yltauL9p+9Dg6PUbn7AQ7XKwxR5zAN+rDkCfkCc/ociS8gdlr46mH0uu24QycCvBMC4GLjch/UniS5ax0SxraweXp0RIb373d9V3/QFI3Fv7wTSVMoV2DoMHR3ws9sQXEM7hlhg4vY42uMaYOw2WdIkvVFexxrJeTj0sG56ilsWEvpik3MfOsJZp54mjGUV7XCJCmnEjOCcAcVP4wXi5gp+K+Por80AfW3YizeUQAXGRe5Fcx/J31gDewyQe6qRrmaO/jMs2n7ReeajrPOQJcNID/zMdWeLpEDw/DyDuSm69C2mPbvPs/7pMhUAPvcHJKBKDg2mTw/qyWWYoivuIhosIeRr36dyeHDzJiQQ1pFUDaS5xFSvkjFpRAkSDKD/MLj6KezUiXbeO897vq6EsCtYP9I0+eXe3M/gfkx0aDr8BOPpza0pr9QhO2vCZ3tSJKovLxd5I474eLz0LNPIXrsec5phOTjvO5IZsXiuT5o43ofUmpvJb7pKpieZORr9zOTOGomYMo36CFgGTm+RJWvU0sjsLPIoWmC676Hu2cz2C+eIKnjBzxhcELHrWBvh/RqCv1rTfA3y2xuc1ujkp525lnB+ZdcLLm5FO89plyB57fD1Cz6CzfAmgH43J3Iqwd5Ke+ozMxwrmuQnnoKucsvwD30XSZfeZlpyTOLY04dg0RUMHyWsu4idRFip+GJMfSmV2HvidJ374oELjYuWyC4h2T2CW389Xov/bm4cP7swcM6eeiQdq9bKfnhcXTPEBIYSBN44nmkliC/ciMqnr7XRuieq8NHLiF3+hr83V8jGRqibPLMaoID1pBjO8pnmPHDqBrETsKdQ+gNe2DsROq7d1UCF9eVb2u+PEJ/2RR/oz+MP9OfOHrjnDvvuo8Ey+seffyFpnOZi3B7DyJLOrC/9nHcxCwuqRINj9D4yj2AITGWIV/DofQQ8TUa/C1Vp0jQAGYNv/uE97+/qObj38nre7fe8SJ3gdkK7hNB4ZqlJvfFATVdLWmSnnvlZntGbz/c9yjeK9VGg+rsONCg5ZM/RXRghMY376XZSCJU1DGbeYN/RZXHSNKQwJbRStnw89/z/v9kT1F53oUX7QTvEoDcnRmX/6HJqwPe/70Xc4kNcwNHduxIKtYES37sIuy+Q7jxqaZhUId79mkKu4eYkzwNbcbKrRh24/kz5ngJl4YEdhp9rYy/5mnV48qk/KsCcF4v3gr2T3FHROtfLmiw3kbxGeMHDrjR0THp/7FN0jI7R218mLIIEsREYpnWhBSlhOFBEv6cqo6CE4ydFn1wCn/187DznTQW7wkAFxuX+6D2hDbuWoPEJsxdOjc5La+9utu3nrtB+qKII0cO4zEoylxWub2LOl+h5hMCHBJMCZ9/TP3NozD7ThuL9wyAxzrdn9bkn1er7HGB/YhPXbht567U9PWYNT09lMfHsdrsufkSdb6DcyFBMAfMGP+bT6j/z5meM9veYWPxngLwWKf7jzV5dpmXB1MjV0TGdmwbOZSWbWjO7uxm+8wUn9cq+9A0xthZdHwabnha/V8vqtf+yN7K9p5409q8030N+aXdRu7sxG6e9bX0nKgUvJBWZKdP0jyBLYt/oRwGNz7daGz/Uei79/TYcpQN9kbJf/4Tpqi/TTH9acLkCqxeLObv1jaLdWw+ga+s+v9q3NrMdAvAh0302z9NQa8j0vMl+IM3APrk+GFlVICrguhjHzThJ+fB5b34csd/BZTm1rf5XPO/aRBPUvbkODlOjpPj5Dg5To6T4x0Z/w+ZkEALyIzlFgAAAABJRU5ErkJggg==";

// ============================================================
//  ESTADO GLOBAL
// ============================================================
let estadoPenalActual = null;

function crearJugadorInicial() {
  return {
    nombre: "",
    posicion: "DEL",
    edad: CONFIG.EDAD_INICIO,
    media: 60,
    atributos: null,
    clubActual: null,
    temporadaActual: 1,
    temporadasForzadoSegunda: 0,
    division: 2,
    loroOcurrio: false,
    eventoRankedsJugado: false,
    carreraTerminada: false,
    historialTemporadas: [],
    entrenamientosUsadosEstaTemporada: 0,
    minijuegosUsadosEstaTemporada: 0,
    temporadaUltimoEvento: -2,
    eventoDisponibleActual: null,
    clasificadoCopaCampeones: false,
    clubCampeonAnterior: null,
    rolAnterior: null,
    rolForzado: null,
    eventoAcusadoJugado: false,
    eventoNittoxJugado: false,
    nittoxRangoQuitado: false,
    eventosUsados: [],
    modoDesafio: false,
    desafioCompletado: false,
    // --- Nuevas mecanicas ---
    moral: 60,
    seleccionConvocado: false,
    partidosSeleccion: 0,
    golesSeleccion: 0,
    esCapitan: false,
    reputacionPersonal: 0,
    logros: [],
    finalCarrera: null,
    calendarioDificultad: "Normal",
    mvpTemporadas: [],
    rachaSinPerder: 0,
    mejorTemporada: null,
    redesSociales: {
      feed: [],
      rivalidades: {},
      cadenaActual: null
    },
    trofeos: {
      segundaDivision: 0,
      primeraDivision: 0,
      copaApa: 0,
      copaArgentina: 0,
      copaDeCampeones: 0,
      botaDeOro: 0,
      balonDeOro: 0
    }
  };
}

let jugador = crearJugadorInicial();
let ofertasActuales = [];

// Instancias de Modales Bootstrap
let modalInfo, modalDecision, modalFichajes, modalPenalInstance;
let modalTLInstance, modalDominiosInstance, modalSSInstance;
let modalRolInstance, modalPartidoInteractivoInstance, modalMomentosClaveInstance;
let modalEntrenamientoAtributos;
let estadoPartidoEspecial = null;

// Variables de minijuegos
let intervalTL = null;
let peleaEstado = null; // V2: guard global del minijuego de pelea
let posicionTL = 0;
let direccionTL = 1;
let modoTiroLibre = 'entrenamiento';

let secuenciaObjetivoKeys = [];
let secuenciaObjetivoSimbolos = [];
let idxSecuenciaDominios = 0;
let timerDominios = null;
let tiempoRestanteDominios = CONFIG.DOMINIOS.TIEMPO;
let escuchandoTeclado = false;

// Control de render incremental del historial (evita re-renderizar todo)
let filasHistorialRenderizadas = 0;
let firmaHistorialRenderizada = "";

// ============================================================
//  UTILIDADES
// ============================================================
const CLAVE_GUARDADO = "pso_carrera_guardada_v1";

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clampMedia(valor) {
  return Math.max(CONFIG.OVR_MIN, Math.min(CONFIG.OVR_MAX, valor));
}

function sumarMedia(delta) {
  // Mecánica de progresión: el delta se reparte en atributos ocultos y la
  // media se recalcula desde ellos (OVR derivado). Si no hay atributos
  // (guardado viejo sin migrar), cae atrás al valor simple.
  if (jugador.atributos && typeof window.calcularOVR === "function" && typeof window.aplicarCambioMediaOculto === "function") {
    const nuevo = window.aplicarCambioMediaOculto(jugador.atributos, jugador.posicion, delta);
    jugador.media = clampMedia(nuevo);
  } else {
    jugador.media = clampMedia(jugador.media + delta);
  }
}

// Fallback visual: si falta la imagen de un badge, muestra el emoji del rol
function imgFallback(imgEl, emoji) {
  if (!imgEl || !imgEl.parentNode) return;
  const span = document.createElement("span");
  span.style.fontSize = "2rem";
  span.innerText = emoji || "⚽";
  imgEl.replaceWith(span);
}

// --- Feedback sonoro simple con WebAudio (sin archivos externos) ---
let audioCtx = null;
function reproducirTono(frecuencia, duracion = 0.15, tipo = "sine") {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = tipo;
    osc.frequency.value = frecuencia;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duracion);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duracion);
  } catch (e) {
    /* audio no disponible: se ignora */
  }
}
const sonidoExito = () => reproducirTono(880, 0.18, "triangle");
const sonidoError = () => reproducirTono(180, 0.25, "sawtooth");
const sonidoGol   = () => { reproducirTono(660, 0.12); setTimeout(() => reproducirTono(990, 0.2), 120); };

// ============================================================
//  PERSISTENCIA
// ============================================================
function guardarPartida() {
  actualizarBloqueoMinijuegos();
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(jugador));
  } catch (e) {
    /* almacenamiento no disponible */
  }
}

function hayPartidaGuardada() {
  try {
    return !!localStorage.getItem(CLAVE_GUARDADO);
  } catch (e) {
    return false;
  }
}

function cargarPartida() {
  try {
    const raw = localStorage.getItem(CLAVE_GUARDADO);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || !data.nombre) return false;
    // Reconstruir clubActual como referencia a CLUBES
    if (data.clubActual && data.clubActual.nombre) {
      const encontrado = CLUBES.find(c => c.nombre === data.clubActual.nombre);
      data.clubActual = encontrado || data.clubActual;
    }
    jugador = Object.assign(crearJugadorInicial(), data);
    // Migración: guardados anteriores a la progresión por atributos no
    // tienen jugador.atributos. Se generan coherentes con la media actual.
    if (!jugador.atributos && typeof window.generarAtributosConOVR === "function" && typeof window.calcularOVR === "function") {
      jugador.atributos = window.generarAtributosConOVR(jugador.posicion, jugador.media);
      jugador.media = window.calcularOVR(jugador.atributos, jugador.posicion);
    }
    if (typeof jugador.division !== "number") {
      sincronizarDivision();
    }
    return true;
  } catch (e) {
    return false;
  }
}

function borrarPartida() {
  try {
    localStorage.removeItem(CLAVE_GUARDADO);
  } catch (e) {
    /* ignorar */
  }
}

// ============================================================
//  INICIALIZACIÓN
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // Validación de datos
  const errores = validarDatos();
  if (errores.length > 0) {
    alert("Error de datos:\n- " + errores.join("\n- "));
    return;
  }

  modalInfo = new bootstrap.Modal(document.getElementById('infoModal'));
  modalDecision = new bootstrap.Modal(document.getElementById('decisionModal'));
  modalFichajes = new bootstrap.Modal(document.getElementById('modal-fichajes'));
  modalPenalInstance = new bootstrap.Modal(document.getElementById('modalPenal'));
  modalTLInstance = new bootstrap.Modal(document.getElementById('modalTiroLibre'));
  modalDominiosInstance = new bootstrap.Modal(document.getElementById('modalDominios'));
  modalSSInstance = new bootstrap.Modal(document.getElementById('modalSS'));
  modalRolInstance = new bootstrap.Modal(document.getElementById('modalRol'));
  modalPartidoInteractivoInstance = new bootstrap.Modal(document.getElementById('modalPartidoInteractivo'));
  modalMomentosClaveInstance = new bootstrap.Modal(document.getElementById('modalMomentosClave'));
  modalEntrenamientoAtributos = new bootstrap.Modal(document.getElementById('modalEntrenamientoAtributos'));

  // Mostrar botón "Continuar" si hay partida guardada
  const btnContinuar = document.getElementById("btn-continuar");
  if (btnContinuar && hayPartidaGuardada()) {
    btnContinuar.classList.remove("hidden");
  }

  // Listener de teclado para minijuegos
  window.addEventListener("keydown", (e) => {
    if (escuchandoTeclado) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
        presionarTeclaDominios(e.code);
      }
    }
  });

  // Limpieza de listeners al cerrar el modal de dominios
  document.getElementById("modalDominios").addEventListener("hidden.bs.modal", () => {
    escuchandoTeclado = false;
    if (timerDominios) { clearInterval(timerDominios); timerDominios = null; }
  });
});

// Configuración extendida de eventos sociales
const configsEventos = {
  SOSSA: { titulo: "Salida con Sossa", texto: "Sossa te invita a salir con la Popa a DORIAN previo al partido.<br><br>¿Aceptas salir?" },
  RICKY: { titulo: "Trucos de Ricky", texto: "Ricky Centurión te ofrece sus CHEATS.<br><br>¿Aceptas usarlos?" },
  BANDIDO: { titulo: "El Mágico", texto: "Bandido te invita un porro mágico antes de jugar.<br><br>¿Aceptas?" },
  DNT: { titulo: "El Dicta", texto: "Dnt te invito a jugar unos amis con CALA.<br><br>¿Aceptas?" },
  NACHO_LV: { titulo: "Entreno con Las Varillas", texto: "NachoLV te invita a hacer un entreno con Las Varillas.<br><br>¿Aceptas?" },
  VALIEL: { titulo: "Promesa en MIX SA", texto: "Valiel te da la oportunidad de quedar como Aspirante tras unos partidos de prueba.<br><br>¿Aceptas jugarlas?" },
  RANKEDS: { titulo: "Rankeds", texto: "Mojo te invita a jugar unas Rankeds del juego.<br><br>¿Qué decides hacer?" },
  CHAGAS: { titulo: "Comer", texto: "Chagas te invita a una GRAN cena.<br><br>¿Aceptas ir a comer?" },
  CASANA: { titulo: "Jugar IOSOCCER", texto: "Casana te invita a jugar IOSOCCER.<br><br>¿Aceptas la partida?" },
  PIEDRA: { titulo: "Busco Piedra", texto: "Nico Piedra te invita a hacer un entreno con él para enseñarte a jugar de todas las posiciones.<br><br>¿Aceptas?" },
  BEKKU: { titulo: "Mix con Bekku", texto: "Bekku te pide jugar mas suelto la mix. <br><br> ¿Aceptas?" },
  CARNICERO: { titulo: "Carnicero de Neuquen", texto: "El Carnicero de Neuquén te invita a un asado.<br><br>¿Aceptas ir?" },
  KULONETA: { titulo: "Kuloneta", texto: "Kurona te invita a su server de discord, a cambio de algo... <br><br>¿Se lo das?" },
  MACHI: { titulo: "Giros", texto: "Te hablan de un jugador Machi que giraba mucho y te interesa probar su tecnica <br><br>¿La practicas?" },
  PIPITA: { titulo: "Titulos Pipa", texto: "Pipita te esta boqueando los titulos que tiene <br><br>¿Que haces?" },
  NOZ: { titulo: "Noz te invita", texto: "Noz te invita a salir previo al entrenamiento <br><br>¿Aceptas?" },
  PYOJO: { titulo: "Salida a bar con Pyojo", texto: "Pyojo te invita a tomar un negroni con 2 rocas <br><br>¿Aceptas?" },
  ORSINI: { titulo: "Paseo con Orsini", texto: "Orsini te pide que lo acompañes a buscar un frasco de flores <br><br>¿Aceptas?", textoRechazo: "Orsini te odia." },
  NICOBAILARIN: { titulo: "A Bailar con Nico", texto: "Nico Bailarin te invita a bailar un enganchado de Fer Palacio <br><br>¿Te da?" },
  RONNIE: { titulo: "Curso de Ronnie", texto: "Ronnie te vende un curso de 1337 <br><br>¿Lo compras?", textoRechazo: "Te llega un MD de Flowy diciendo que sos un fraca." },
  BAREIRO: { titulo: "Oferta Bareiro", texto: "Bareiro te invita a jugar en Argentinos Juniors <br><br>¿Vas con el?" },
  MUSA: { titulo: "El Establo de Musa", texto: "Musa te invita a su establo para que veas como entrena<br><br>¿Aceptas?", textoRechazo: "Te perdes las habilidades del CABA." },
  KOLT: { titulo: "Frio con Grasa", texto: "Kolt te invita un finde semana a su pueblo natal <br><br>¿Vas?" },
  VIEJO: { titulo: "Viejo y Carita", texto: "Viejo y Carita te invitan a jugar al Dark Souls <br><br>¿Jugas con ellos?", textoRechazo: "Carita te bloqueo de todos lados." },
  PISA: { titulo: "Pase Pisa", texto: "Pisa te enseña a tirar su pase especial <br><br>¿Lo aprendes?" },
  PERUANOS: { titulo: "Peruanos", texto: "Strahl y Cubarsi te invitan a Peru, pero tendrias que jugar un partido desde ahi <br><br>¿Vas?" },
  PUSKAS: { titulo: "Componentes Puskas", texto: "Puskas te ofrece sus componentes <br><br>¿Los compras?" },
  GLIZZI: { titulo: "Aprendes(? con Glizzi", texto: "Glizzi te quiere enseñar a jugar <br><br>¿Practicas con el?", textoRechazo: "No te perdiste de nada." },
  PASO: { titulo: "Terraria", texto: "Paso te invita a jugar a Terraria con Marabola <br><br>¿Jugas con ellos?", textoRechazo: "Marabola te odia." },
  MATUTE: { titulo: "Semillero Chaco", texto: "Matute te invita a su semillero Chaco For Ever <br><br>¿Vas a jugar?" },

  // ============ EVENTOS NUEVOS V2 ============
  CERBE: {
    titulo: "Clubes Pro",
    texto: "Cerbe te pide que le tires un pase para convertir él.<br><br>¿Se lo tirás?",
    dosOpciones: {
      a: { texto: "⚽ Se la tirás", desc: "Opción A" },
      b: { texto: "🙅 No se la tirás", desc: "Opción B" }
    }
  },
  NERVA: {
    titulo: "Pelea de Wachines",
    texto: "Nerva se está peleando con Matias Fernandez.<br><br>¿Qué hacés?",
    dosOpciones: {
      a: { texto: "📱 Doxeás a los 2", desc: "Opción A" },
      b: { texto: "🤐 No hacés nada", desc: "Opción B" }
    }
  },
  NITTOX: {
    titulo: "Sargento Nittox",
    texto: "Nittox te quiere sacar el rol.<br><br>¿Volvés a jugar para defenderte?",
    dosOpciones: {
      a: { texto: "🎮 Volvés a jugar", desc: "Opción A" },
      b: { texto: "😴 No jugás más hasta que se le pase", desc: "Opción B" }
    }
  },
  KROSTY: { titulo: "Invitación rara", texto: "Krosty te invita a jugar a Hasbullitah.<br><br>¿Vas?", textoRechazo: "Rechazaste la invitación de Krosty. Hasbullitah sigue esperando." },
  PRIMOS: {
    titulo: "Primos",
    texto: "Benjita y Theo te dicen de ser primos.<br><br>¿Qué hacés?",
    dosOpciones: {
      a: { texto: "✋ Los mandás a cagar", desc: "Opción A" },
      b: { texto: "🤝 Aceptás", desc: "Opción B" }
    }
  },
  ACUSADO: {
    titulo: "Acusado de Cheats",
    texto: "Después de una mix en la que hiciste 4 goles, te están acusando de cheats.<br><br>Estás OBLIGADO a hacerte una SS.<br><br>No hay vueltas: te hacen el SS ahora mismo.",
    sinRechazo: true
  },
  TAMBUPA: { titulo: "Futbol 5 con Tambupa", 
    texto:"Tambupa te invita  a jugar un futbol 5.<br><br>¿Aceptas?",
  dosOpciones: {
    a: { texto: "⚽ Aceptás", desc: "Opción A" },
    b: { texto: "🙅 Rechazás", desc: "Opción B" }
    }
  },
  COCCARO: { titulo: "Invitación por plata", texto: "Coccaro te invita a jugar a su equipo LAFERRERE a cambio de plata.<br><br>¿Aceptas?" },
  CHILE: { titulo: "Viaje a Chile", texto: "Mati te invita a su casa en Chile.<br><br>¿Vas?" }
};

function eventoEnIdioma(config) {
  if (!config || !(typeof prefs !== "undefined" && prefs.idioma === "pt")) return config;
  const reemplazos = [
    ["Salida con", "Saída com"], ["Invitación", "Convite"], ["Trucos de", "Truques de"], ["Entreno con", "Treino com"],
    ["Promesa en", "Promessa no"], ["Oferta", "Oferta"], ["Curso de", "Curso de"], ["Paseo con", "Passeio com"],
    ["Te invita a", "convida você para"], ["te invita a", "convida você para"], ["te pide", "pede para você"], ["te ofrece", "oferece a você"],
    ["te da la oportunidad", "dá a você a oportunidade"], ["¿Aceptas", "Você aceita"], ["¿Aceptás", "Você aceita"], ["¿Qué haces?", "O que você faz?"],
    ["¿Qué hacés?", "O que você faz?"], ["¿Vas?", "Você vai?"], ["¿Vas con el?", "Você vai com ele?"], ["¿Jugas", "Você joga"],
    ["¿Practicas", "Você pratica"], ["¿Lo compras?", "Você compra?"], ["¿Los compras?", "Você compra?"], ["¿Aceptas usarlos?", "Você aceita usá-los?"],
    ["¿Aceptas ir", "Você aceita ir"], ["¿Aceptas la partida?", "Você aceita a partida?"], ["¿Aceptas salir?", "Você aceita sair?"],
    ["¿Se lo das?", "Você entrega?"], ["¿La practicas?", "Você pratica?"], ["Aceptas", "Aceitar"], ["Rechazar", "Recusar"],
    ["Jugar", "Jogar"], ["Comer", "Comer"], ["Giros", "Giros"], ["Primos", "Primos"], ["Rankeds", "Rankeds"]
  ];
  function convertir(texto) {
    return reemplazos.reduce((actual, par) => actual.split(par[0]).join(par[1]), String(texto || ""));
  }
  const traducido = Object.assign({}, config, { titulo: convertir(config.titulo), texto: convertir(config.texto) });
  if (config.dosOpciones) {
    traducido.dosOpciones = {
      a: Object.assign({}, config.dosOpciones.a, { texto: convertir(config.dosOpciones.a.texto) }),
      b: Object.assign({}, config.dosOpciones.b, { texto: convertir(config.dosOpciones.b.texto) })
    };
  }
  return traducido;
}


//  CONDICIÓN OBLIGATORIA DE LORO
// ============================================================
function verificarCondicionLoro() {
  // FIX V2: la intervención de Loro tiene poca chance de aparecer y no
  // puede dispararse al iniciar la partida: recién puede ocurrir desde
  // la temporada mínima configurada y solo UNA vez por carrera.
  if (!jugador.loroOcurrio &&
      jugador.temporadaActual >= CONFIG.TEMPORADA_MINIMA_LORO &&
      Math.random() < CONFIG.PROB_LORO) {
    jugador.loroOcurrio = true;
    jugador.temporadasForzadoSegunda = CONFIG.SANCION_LORO_TEMPORADAS;
    mostrarNotificacion(
      "🚨 Intervención Obligatoria de Loro",
      "Loro ha intervenido en tu carrera de forma inevitable.<br><br><strong>Quedas sancionado a jugar en Segunda División por las próximas " + CONFIG.SANCION_LORO_TEMPORADAS + " temporadas.</strong>"
    );
  }
}

// V2 - Nittox: al pasar a la próxima temporada se puede recuperar el rango.
function recuperarRangoNittox() {
  if (jugador.nittoxRangoQuitado) {
    jugador.nittoxRangoQuitado = false;
    jugador.eventoNittoxJugado = false;
    mostrarNotificacion(
      "🎮 Rango Recuperado",
      "Pasó la temporada del Sargento Nittox y te dejaste el cuerpo. <strong>Recuperaste tu rango</strong> y podés volver a jugar mixs de tu nivel."
    );
  }
}


//  SISTEMA DE ROLES
// ============================================================
// Rol efectivo: respeta el rol forzado (ej: Aspirante por evento de Valiel),
// salvo que el rol natural por media sea estrictamente superior.
function rolEfectivo() {
  const natural = obtenerRol(jugador.media);
  // V2 - Nittox: si Nittox te sacó el rol, tu rango vuelve a Normal una
  // temporada (solo te afecta si tu rango natural era Promesa o Aspirante).
  if (jugador.nittoxRangoQuitado) {
    const idxAspirante = ROLES.findIndex(r => r.nombre === "Aspirante");
    if (ROLES.indexOf(natural) !== -1 && ROLES.indexOf(natural) <= idxAspirante) {
      return ROLES[0];
    }
  }
  if (jugador.rolForzado) {
    const forzado = ROLES.find(r => r.nombre === jugador.rolForzado);
    if (forzado) {
      if (ROLES.indexOf(natural) > ROLES.indexOf(forzado)) return natural;
      return forzado;
    }
  }
  return natural;
}

function cambiarMoral(delta) {
  if (typeof ajustarMoral === "function") {
    ajustarMoral(delta);
    return;
  }
  jugador.moral = Math.max(CONFIG.MORAL_MIN, Math.min(CONFIG.MORAL_MAX, (jugador.moral || 60) + delta));
}

function verificarCambioRol() {
  const rolActual = rolEfectivo();
  const rolAnteriorNombre = jugador.rolAnterior ? jugador.rolAnterior.nombre : null;

  if (!jugador.rolAnterior || rolActual.nombre !== rolAnteriorNombre) {
    if (jugador.rolAnterior !== null) {
      jugador.rolAnterior = rolActual;
      mostrarModalRol(rolActual);
      return true;
    }
    jugador.rolAnterior = rolActual;
  }
  return false;
}

function mostrarModalRol(rol) {
  const tieneBadge = !!(rol.imagen && rol.imagen.indexOf("imagenes/") === 0);
  const imgTag = tieneBadge
    ? `<img src="${rol.imagen}" alt="${rol.nombre}" style="width:100px;height:100px;object-fit:contain;filter:drop-shadow(0 0 12px ${rol.color});margin:10px auto;display:block;" onerror="imgFallback(this, '${rol.emoji}')">`
    : `<div style="font-size:4rem;margin:10px auto;text-align:center;">${rol.emoji}</div>`;

  document.getElementById("rolModalEmoji").innerHTML = imgTag;
  document.getElementById("rolModalNombre").innerText = rol.nombre;
  document.getElementById("rolModalNombre").style.color = rol.color;
  document.getElementById("rolModalDescripcion").innerText = rol.descripcion;
  document.getElementById("rolModalOVR").innerText = jugador.media + " OVR";

  modalRolInstance.show();
}


//  SELECTOR DE MINIJUEGOS SEGÚN POSICIÓN
// ============================================================
function iniciarMinijuegoEntrenamiento() {
  if (jugador.minijuegosUsadosEstaTemporada >= CONFIG.MINIJUEGOS_POR_TEMPORADA) {
    mostrarNotificacion("Atención", "Ya realizaste tu minijuego de entrenamiento de esta temporada.");
    return;
  }

  switch (jugador.posicion) {
    case "DEL": iniciarMinijuegoTiroConArquero(); break;
    case "CM":  iniciarMinijuegoTiroLibre(); break;
    case "DEF": iniciarMinijuegoBarrida(); break;
    case "GK":  iniciarMinijuegoAtajadaGuantes(); break;
    default:    iniciarMinijuegoTiroLibre(); break;
  }
}

// MINIJUEGO DELANTEROS: REMATE CON ARQUERO EN MOVIMIENTO
function iniciarMinijuegoTiroConArquero() {
  const zonasArquero = ["Izquierda", "Centro", "Derecha"];
  const arqueroCubre = zonasArquero[Math.floor(Math.random() * zonasArquero.length)];

  document.getElementById("modalDominiosTitulo").innerText = "⚽ Práctica de Tiro con Arquero";
  document.getElementById("secuenciaObjetivo").innerText = "⚽ El arquero se mueve bajo el arco... ¡Elige a dónde definir!";
  document.getElementById("resultadoDominios").innerHTML = `
    <div class="d-flex justify-content-center gap-2 mt-3">
      <button class="btn btn-outline-warning" onclick="patearAlArco('Izquierda', '${arqueroCubre}')">⬅️ Izquierda</button>
      <button class="btn btn-outline-warning" onclick="patearAlArco('Centro', '${arqueroCubre}')">⬆️ Centro</button>
      <button class="btn btn-outline-warning" onclick="patearAlArco('Derecha', '${arqueroCubre}')">➡️ Derecha</button>
    </div>
  `;
  document.getElementById("tiempoDominiosRow").style.display = "none";
  modalDominiosInstance.show();
}

function patearAlArco(eleccion, zonaArquero) {
  const resDiv = document.getElementById("resultadoDominios");
  if (eleccion !== zonaArquero) {
    resDiv.className = "text-success fw-bold fs-5 mt-2";
    resDiv.innerText = `⚽ ¡GOOOOOOL! El arquero se tiró a la ${zonaArquero} y definiste a la ${eleccion}. (+${CONFIG.GUANTES.SUBIDA_OVR} OVR)`;
    sumarMedia(CONFIG.GUANTES.SUBIDA_OVR);
    sonidoGol();
  } else {
    resDiv.className = "text-danger fw-bold fs-5 mt-2";
    resDiv.innerText = `🧤 ¡ATAJÓ EL ARQUERO! Tapó el disparo a la ${eleccion}.`;
    sonidoError();
  }
  jugador.minijuegosUsadosEstaTemporada = 1;
  guardarPartida();
  setTimeout(() => { modalDominiosInstance.hide(); verificarCambioRol(); actualizarInterfaz(); }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
}

// MINIJUEGO CENTROCAMPISTAS: TIRO LIBRE DE PRECISIÓN
function iniciarMinijuegoTiroLibre(modo = 'entrenamiento') {
  modoTiroLibre = modo;
  if (modo === 'entrenamiento' && jugador.minijuegosUsadosEstaTemporada >= CONFIG.MINIJUEGOS_POR_TEMPORADA) {
    mostrarNotificacion("Atención", "Ya realizaste tu minijuego de entrenamiento de esta temporada.");
    return;
  }

  posicionTL = 0;
  direccionTL = 1;
  document.getElementById("btnPatearTL").disabled = false;
  document.getElementById("resultadoTL").innerHTML = "";
  document.getElementById("modalTLTitulo").innerText = "🎯 Tiro Libre de Precisión";
  document.getElementById("instruccionTL").innerText = "Presiona ¡DISPARAR! cuando la barra esté en el centro.";

  modalTLInstance.show();

  intervalTL = setInterval(() => {
    posicionTL += direccionTL * CONFIG.TIRO_LIBRE.VELOCIDAD;
    if (posicionTL >= 100 || posicionTL <= 0) direccionTL *= -1;
    const barra = document.getElementById("barraTL");
    barra.style.width = `${posicionTL}%`;
    barra.setAttribute("aria-valuenow", Math.round(posicionTL));
  }, CONFIG.TIRO_LIBRE.TICK_MS);
}

function detenerTiroLibre() {
  clearInterval(intervalTL);
  document.getElementById("btnPatearTL").disabled = true;

  const resultadoDiv = document.getElementById("resultadoTL");

  if (posicionTL >= CONFIG.TIRO_LIBRE.ZONA_MIN && posicionTL <= CONFIG.TIRO_LIBRE.ZONA_MAX) {
    resultadoDiv.className = "text-success fw-bold fs-5";
    resultadoDiv.innerHTML = `🎯 ¡GOLAZO AL ÁNGULO! (+${CONFIG.TIRO_LIBRE.SUBIDA_OVR} OVR)`;
    sonidoGol();
    if (modoTiroLibre === 'entrenamiento') {
      sumarMedia(CONFIG.TIRO_LIBRE.SUBIDA_OVR);
      jugador.minijuegosUsadosEstaTemporada = 1;
    }
  } else {
    resultadoDiv.className = "text-danger fw-bold fs-5";
    resultadoDiv.innerHTML = "❌ Remate fuera de puerta.";
    sonidoError();
    if (modoTiroLibre === 'entrenamiento') {
      jugador.minijuegosUsadosEstaTemporada = 1;
    }
  }

  guardarPartida();
  setTimeout(() => {
    modalTLInstance.hide();
    verificarCambioRol();
    actualizarInterfaz();
  }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
}

// MINIJUEGO DEFENSAS: BARRIDA EXITOSA
function iniciarMinijuegoBarrida() {
  posicionTL = 0;
  direccionTL = 1;
  document.getElementById("btnPatearTL").disabled = false;
  document.getElementById("resultadoTL").innerHTML = "";
  document.getElementById("modalTLTitulo").innerText = "🦵 Barrida Exitosa";
  document.getElementById("instruccionTL").innerText = "¡El delantero avanza! Tírate a barrer en la zona verde (centro).";

  modalTLInstance.show();

  intervalTL = setInterval(() => {
    posicionTL += direccionTL * CONFIG.BARRIDA.VELOCIDAD;
    if (posicionTL >= 100 || posicionTL <= 0) direccionTL *= -1;
    const barra = document.getElementById("barraTL");
    barra.style.width = `${posicionTL}%`;
    barra.setAttribute("aria-valuenow", Math.round(posicionTL));
  }, CONFIG.BARRIDA.TICK_MS);
}

function detenerBarrida() {
  clearInterval(intervalTL);
  document.getElementById("btnPatearTL").disabled = true;
  const resultadoDiv = document.getElementById("resultadoTL");

  if (posicionTL >= CONFIG.BARRIDA.ZONA_MIN && posicionTL <= CONFIG.BARRIDA.ZONA_MAX) {
    resultadoDiv.className = "text-success fw-bold fs-5";
    resultadoDiv.innerHTML = `🦵 ¡BARRIDA PERFECTA! Le sacaste el balón limpio. (+${CONFIG.BARRIDA.SUBIDA_OVR} OVR)`;
    sumarMedia(CONFIG.BARRIDA.SUBIDA_OVR);
    sonidoExito();
  } else {
    resultadoDiv.className = "text-danger fw-bold fs-5";
    resultadoDiv.innerHTML = "❌ Barrida fallida. El delantero te dejó en el piso.";
    sonidoError();
  }

  jugador.minijuegosUsadosEstaTemporada = 1;
  guardarPartida();
  setTimeout(() => {
    modalTLInstance.hide();
    verificarCambioRol();
    actualizarInterfaz();
  }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
}

// MINIJUEGO ARQUEROS: ATAJADA CON GUANTES
function iniciarMinijuegoAtajadaGuantes() {
  const posicionesGuante = [
    { dir: "ArrowLeft", sim: "🧤 GUANTES A LA IZQUIERDA (⬅️)" },
    { dir: "ArrowRight", sim: "🧤 GUANTES A LA DERECHA (➡️)" },
    { dir: "ArrowUp", sim: "🧤 GUANTES AL ÁNGULO SUPERIOR (⬆️)" }
  ];

  const pick = posicionesGuante[Math.floor(Math.random() * posicionesGuante.length)];

  document.getElementById("modalDominiosTitulo").innerText = "🧤 Atajada con Guantes";
  document.getElementById("secuenciaObjetivo").innerText = `⚡ ¡REMATE AL ARCO! Coloca los guantes: ${pick.sim}`;
  document.getElementById("resultadoDominios").innerHTML = "";
  document.getElementById("tiempoDominiosRow").style.display = "none";
  modalDominiosInstance.show();

  const manejarGuantes = (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp"].includes(e.code)) {
      window.removeEventListener("keydown", manejarGuantes);
      if (e.code === pick.dir) {
        document.getElementById("resultadoDominios").className = "text-success fw-bold fs-5 mt-2";
        document.getElementById("resultadoDominios").innerText = `🧤 ¡DESVIADO CON LOS GUANTES! (+${CONFIG.GUANTES.SUBIDA_OVR} OVR)`;
        sumarMedia(CONFIG.GUANTES.SUBIDA_OVR);
        sonidoExito();
      } else {
        document.getElementById("resultadoDominios").className = "text-danger fw-bold fs-5 mt-2";
        document.getElementById("resultadoDominios").innerText = "❌ El disparo venció tus guantes.";
        sonidoError();
      }
      jugador.minijuegosUsadosEstaTemporada = 1;
      guardarPartida();
      setTimeout(() => { modalDominiosInstance.hide(); verificarCambioRol(); actualizarInterfaz(); }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
    }
  };

  window.addEventListener("keydown", manejarGuantes);

  // FIX: remover el listener si el modal se cierra de otra forma (evita fuga)
  const modalEl = document.getElementById("modalDominios");
  const limpiar = () => {
    window.removeEventListener("keydown", manejarGuantes);
    modalEl.removeEventListener("hidden.bs.modal", limpiar);
  };
  modalEl.addEventListener("hidden.bs.modal", limpiar);
}


//  MINIJUEGO GENERAL: DESAFÍO DE DOMINIOS
// ============================================================
function iniciarMinijuegoDominios() {
  if (jugador.minijuegosUsadosEstaTemporada >= CONFIG.MINIJUEGOS_POR_TEMPORADA) {
    mostrarNotificacion("Atención", "Ya realizaste tu minijuego de entrenamiento de esta temporada.");
    return;
  }

  const opciones = [
    { key: "ArrowUp", sim: "⬆️" },
    { key: "ArrowDown", sim: "⬇️" },
    { key: "ArrowLeft", sim: "⬅️" },
    { key: "ArrowRight", sim: "➡️" }
  ];

  secuenciaObjetivoKeys = [];
  secuenciaObjetivoSimbolos = [];
  idxSecuenciaDominios = 0;

  for (let i = 0; i < CONFIG.DOMINIOS.LARGO; i++) {
    const pick = opciones[Math.floor(Math.random() * opciones.length)];
    secuenciaObjetivoKeys.push(pick.key);
    secuenciaObjetivoSimbolos.push(pick.sim);
  }

  document.getElementById("modalDominiosTitulo").innerText = "⚽ Desafío de Dominios";
  document.getElementById("secuenciaObjetivo").innerText = secuenciaObjetivoSimbolos.join(" ");
  document.getElementById("resultadoDominios").innerHTML = "";
  document.getElementById("tiempoDominiosRow").style.display = "";
  tiempoRestanteDominios = CONFIG.DOMINIOS.TIEMPO;
  document.getElementById("tiempoDominios").innerText = CONFIG.DOMINIOS.TIEMPO.toFixed(1);

  escuchandoTeclado = true;
  modalDominiosInstance.show();

  timerDominios = setInterval(() => {
    tiempoRestanteDominios -= 0.1;
    document.getElementById("tiempoDominios").innerText = Math.max(0, tiempoRestanteDominios).toFixed(1);

    if (tiempoRestanteDominios <= 0) {
      finalizarMinijuegoDominios(false, "❌ ¡Se acabó el tiempo!");
    }
  }, CONFIG.DOMINIOS.TICK_MS);
}

function presionarTeclaDominios(tecla) {
  if (!escuchandoTeclado) return;

  if (tecla === secuenciaObjetivoKeys[idxSecuenciaDominios]) {
    idxSecuenciaDominios++;

    let visuales = [...secuenciaObjetivoSimbolos];
    for (let i = 0; i < idxSecuenciaDominios; i++) {
      visuales[i] = "✅";
    }
    document.getElementById("secuenciaObjetivo").innerText = visuales.join(" ");

    if (idxSecuenciaDominios === secuenciaObjetivoKeys.length) {
      finalizarMinijuegoDominios(true, `✨ ¡Excelente control! (+${CONFIG.DOMINIOS.SUBIDA_OVR} OVR)`);
    }
  } else {
    finalizarMinijuegoDominios(false, "❌ Te equivocaste de dirección.");
  }
}

function finalizarMinijuegoDominios(exito, msg) {
  escuchandoTeclado = false;
  clearInterval(timerDominios);
  timerDominios = null;
  const resDiv = document.getElementById("resultadoDominios");

  if (exito) {
    resDiv.className = "text-success fw-bold fs-5 mt-2";
    resDiv.innerText = msg;
    sumarMedia(CONFIG.DOMINIOS.SUBIDA_OVR);
    sonidoExito();
  } else {
    resDiv.className = "text-danger fw-bold fs-5 mt-2";
    resDiv.innerText = msg;
    sonidoError();
  }

  jugador.minijuegosUsadosEstaTemporada = 1;
  guardarPartida();

  setTimeout(() => {
    modalDominiosInstance.hide();
    verificarCambioRol();
    actualizarInterfaz();
  }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
}

// ============================================================
//  MINIJUEGO: REVISIÓN DE CHEATS (SS CENTURIÓN)
// ============================================================
function ejecutarScreenShare(callback) {
  document.getElementById("escaneoSSAnim").style.display = "inline-block";
  document.getElementById("resultadoSS").className = "fw-bold fs-5 text-warning";
  document.getElementById("resultadoSS").innerText = "Revisando carpetas y procesos sospechosos...";

  modalSSInstance.show();

  setTimeout(() => {
    document.getElementById("escaneoSSAnim").style.display = "none";

    const atrapado = Math.random() < CONFIG.SCREENSHARE.PROB_ATRAPADO;

    if (atrapado) {
      document.getElementById("resultadoSS").className = "fw-bold fs-5 text-danger";
      document.getElementById("resultadoSS").innerHTML = `🚨 ¡DETECTADO! Encontraron programas indebidos.<br>Baneo directo: -${CONFIG.SCREENSHARE.PENALIZACION} OVR y sanción de ${CONFIG.SANCION_LORO_TEMPORADAS} temporadas en Segunda.`;
      sumarMedia(-CONFIG.SCREENSHARE.PENALIZACION);
      jugador.temporadasForzadoSegunda = CONFIG.SANCION_LORO_TEMPORADAS;
      sonidoError();
    } else {
      document.getElementById("resultadoSS").className = "fw-bold fs-5 text-success";
      document.getElementById("resultadoSS").innerHTML = `✅ SCREENSHARE LIMPIO.<br>Zafaste la revisión. ¡Aprovechas los cheats y sumas +${CONFIG.SCREENSHARE.BONUS} OVR!`;
      sumarMedia(CONFIG.SCREENSHARE.BONUS);
      sonidoExito();
    }

    guardarPartida();
    setTimeout(() => {
      modalSSInstance.hide();
      verificarCambioRol();
      actualizarInterfaz();
      if (callback) callback();
    }, CONFIG.TIMING.RESULTADO_SS_MS);
  }, CONFIG.TIMING.RESULTADO_SS_MS);
}

// ============================================================
//  V2 - SS OBLIGATORIO: EVENTO "ACUSADO DE CHEATS"
//  Sale con probabilidad MUY baja, una sola vez por partida.
//  Si salís sin nada: "Sos legit... o capaz escondés bien" (+3 OVR).
//  Si sale mal: "Te banearon, 3 temporadas sin jugar".
// ============================================================
function ejecutarAcusacionCheats() {
  document.getElementById("escaneoSSAnim").style.display = "inline-block";
  document.getElementById("resultadoSS").className = "fw-bold fs-5 text-warning";
  document.getElementById("resultadoSS").innerText = "Los mods revisan tu PC a fondo...";

  modalSSInstance.show();

  setTimeout(() => {
    document.getElementById("escaneoSSAnim").style.display = "none";

    const atrapado = Math.random() < CONFIG.PROB_ACUSADO_ATRAPADO;

    if (atrapado) {
      document.getElementById("resultadoSS").className = "fw-bold fs-5 text-danger";
      document.getElementById("resultadoSS").innerHTML = `🚨 ¡TE BANEARON! Había cosas que no debían estar.<br>Sanción: ${CONFIG.SANCION_LORO_TEMPORADAS} temporadas sin jugar en Primera.`;
      jugador.temporadasForzadoSegunda = CONFIG.SANCION_LORO_TEMPORADAS;
      sonidoError();
    } else {
      document.getElementById("resultadoSS").className = "fw-bold fs-5 text-success";
      document.getElementById("resultadoSS").innerHTML = `✅ Saliste sin nada. Sos legítimo... o capáz escondés bien (+3 OVR).`;
      sumarMedia(3);
      sonidoExito();
    }

    guardarPartida();
    setTimeout(() => {
      modalSSInstance.hide();
      verificarCambioRol();
      actualizarInterfaz();
    }, CONFIG.TIMING.RESULTADO_SS_MS);
  }, CONFIG.TIMING.RESULTADO_SS_MS);
}

// ============================================================
//  MINIJUEGO DECISIVO AL SIMULAR TEMPORADA (SÓLO DEL Y CM)
// ============================================================
function iniciarMinijuegoDecisivoTemporada(tipoContexto, callback) {
  const mensaje = tipoContexto === "TITULO"
    ? "🏆 ¡ÚLTIMA JUGADA DEL PARTIDO! Gambetea al equipo rival para ganar el TÍTULO."
    : "⚠️ ¡JUGADA DECISIVA! Gambetea a la defensa para SALVARTE DEL DESCENSO.";

  mostrarNotificacion("Momento Clave", `${mensaje}<br><br><strong>Haz clic para iniciar el avance.</strong>`, () => {
    let paso = 0;
    const totalPasos = CONFIG.GAMBETA.PASOS;

    function siguienteGambeta() {
      if (paso >= totalPasos) {
        mostrarNotificacion("¡HÉROE!", "🔥 ¡Pasaste a todos los rivales y convertiste el gol decisivo!", () => callback(true));
        return;
      }

      const exitoPaso = Math.random() < (jugador.media / 110);
      if (exitoPaso) {
        paso++;
        mostrarNotificacion(`Gambeta ${paso}/${totalPasos}`, "✨ ¡Excelente amague! Dejaste atrás a un rival.", siguienteGambeta);
      } else {
        mostrarNotificacion("❌ Interceptado", "Te quitaron el balón en el último tramo.", () => callback(false));
      }
    }

    siguienteGambeta();
  });
}

// ============================================================
//  PARTIDOS RANDOM INTERACTIVOS (baja frecuencia / configurable)
//  No toca la lógica de finales: se reutiliza el mismo flujo de
//  cierre de temporada cuando el partido especial se resuelve.
// ============================================================
function generarMomentoClave() {
  const posicion = (jugador && jugador.posicion) || "DEL";
  const catalogo = {
    GK: [
      { id: "arquero-salida", titulo: "🧤 Salida limpia", descripcion: "La pelota viene larga y hay que salir con decisión para sacar la presión.", contexto: "arquero", opciones: ["Salir por arriba", "Bajar y despejar", "Ir al centro del área"], exitoBase: 0.62 },
      { id: "arquero-remate", titulo: "🛡️ Remate a quemarropa", descripcion: "El rival arma dentro del área y hay que adivinar la dirección del disparo.", contexto: "arquero", opciones: ["Tirarte al palo", "Bajar al centro", "Cubrir el primer poste"], exitoBase: 0.60 },
      { id: "arquero-largo", titulo: "📤 Lanzamiento largo", descripcion: "El equipo necesita un pase largo para abrir la defensa rival.", contexto: "arquero", opciones: ["Lanzar largo", "Pase corto", "Pase al pivote"], exitoBase: 0.58 }
    ],
    DEF: [
      { id: "despeje-defensa", titulo: "🧱 Despeje clave", descripcion: "Se arma una pelota cruzada y hay que cerrar el espacio antes del remate.", contexto: "defensiva", opciones: ["Despejar hacia la banda", "Sacarlo con el cuerpo", "Cruzar y tapar"], exitoBase: 0.60 },
      { id: "corte-defensa", titulo: "✂️ Corte defensivo", descripcion: "El mediocampista rival intenta romper la línea y hay que cortar el pase.", contexto: "defensiva", opciones: ["Intervenir antes", "Pisar al jugador", "Esperar la pelota"], exitoBase: 0.58 },
      { id: "corner-ofensivo", titulo: "⚽ Córner ofensivo", descripcion: "Hay un córner bien desarrollado. El contexto lo justifica para subir a rematar.", contexto: "córner ofensivo", opciones: ["Subir al primer palo", "Ir a la segunda línea", "Pedir el centro"], exitoBase: 0.52 }
    ],
    MED: [
      { id: "mediocampo-recepcion", titulo: "🧠 Recepción bajo presión", descripcion: "Hay un pase filtrado y tenés que controlar primero para seguir el ataque.", contexto: "mediocampo", opciones: ["Controlar y girar", "Pisar y jugar de primera", "Dar un pase atrás"], exitoBase: 0.59 },
      { id: "mediocampo-espacio", titulo: "📍 Romper líneas", descripcion: "Te abren un hueco entre líneas para empezar la jugada decisiva.", contexto: "mediocampo", opciones: ["Pase al hueco", "Recortar y tirar", "Mediocentro directo"], exitoBase: 0.57 },
      { id: "mediocampo-espiga", titulo: "⚡ Transición rápida", descripcion: "El equipo rival está desordenado y hay una contra rápida para crear peligro.", contexto: "mediocampo", opciones: ["Pase profundo", "Sacar centro", "Jugar la pared"], exitoBase: 0.55 }
    ],
    DEL: [
      { id: "remate-areas", titulo: "🎯 Remate en el área", descripcion: "Tenés la posición ideal para definir antes de que salga el arquero.", contexto: "ofensivo", opciones: ["Remate corto", "Zurdazo al palo", "Pique a la linea"], exitoBase: 0.61 },
      { id: "desmarque", titulo: "🔀 Desmarque decisivo", descripcion: "Bajo presión te sacás a tu marcador y hay que aprovechar la ventana de ataque.", contexto: "ofensivo", opciones: ["Quedarte en el área", "Ir al espacio", "Pegar la vuelta"], exitoBase: 0.60 },
      { id: "cabezazo", titulo: "🦶 Cabezazo a gol", descripcion: "El centro llega perfecto y hay que sentar el balón en el segundo palo.", contexto: "ofensivo", opciones: ["Cabezazo fuerte", "A la espalda", "Picarlo"], exitoBase: 0.59 }
    ]
  };

  const pool = catalogo[posicion] || catalogo.DEL;
  return pool[Math.floor(Math.random() * pool.length)];
}

function formaRecientePartido() {
  const historial = jugador.historialTemporadas || [];
  const ultima = historial[historial.length - 1];
  if (!ultima) return 60;
  const produccion = (ultima.goles || 0) + (ultima.asistencias || 0);
  return Math.max(25, Math.min(99, 50 + produccion * 2 + (ultima.trofeos !== "Ninguno" ? 12 : 0)));
}

function generarPartidoInteractivo() {
  const club = jugador.clubActual || CLUBES[0];
  const rivales = CLUBES.filter(c => c && c.nombre !== club.nombre);
  const rival = rivales[Math.floor(Math.random() * rivales.length)] || CLUBES[0];
  const esPrimera = jugador.division === 1 && jugador.temporadasForzadoSegunda === 0;
  const importancia = esPrimera ? (jugador.temporadaActual % 3 === 0 ? "Copa de Campeones" : "Primera División") : "Segunda División";
  const local = Math.random() < 0.5;
  const titular = jugador.media >= (club.reputacion * 10 - 5) || jugador.edad < 22;
  const posicion = jugador.posicion === "CM" ? "MED" : jugador.posicion;
  const minutos = titular ? 90 : 34;
  const eventos = [15, 32, 58, 78].map(function(minuto, indice) {
    const catalogo = {
      GK: ["Ataque rival", "Remate a quemarropa", "Centro peligroso", "Último ataque"],
      DEF: ["Ataque rival", "Corte defensivo", "Córner ofensivo", "Último ataque"],
      MED: ["Salida bajo presión", "Recepción entre líneas", "Transición rápida", "Último ataque"],
      DEL: ["Ataque rival", "Oportunidad del jugador", "Desmarque decisivo", "Último ataque"]
    }[posicion] || [];
    return { minuto, titulo: catalogo[indice], descripcion: "El partido entra en una fase decisiva.", opciones: [] };
  });
  return {
    esPartidoInteractivo: true,
    rival,
    club,
    competencia: importancia,
    local,
    titular,
    posicion,
    ovr: jugador.media,
    estadoFisico: Math.max(45, Math.min(99, 82 + (jugador.edad < 25 ? 8 : 0) - (jugador.edad > 30 ? 12 : 0))),
    moral: jugador.moral || 60,
    forma: formaRecientePartido(),
    importancia: importancia === "Copa de Campeones" ? "Muy alta" : "Alta",
    minutos,
    marcador: { club: 0, rival: 0 },
    eventos,
    indiceEvento: 0,
    goles: 0,
    asistencias: 0,
    acciones: []
  };
}

function accionesPartidoInteractivo(partido) {
  const pos = partido.posicion;
  if (pos === "GK") return [
    { id: "salir", texto: "🧤 Sale a cortar", atributo: "estadoFisico" },
    { id: "palo", texto: "🛡️ Cubre el palo", atributo: "moral" },
    { id: "largo", texto: "📤 Saque largo", atributo: "forma" }
  ];
  if (pos === "DEF") return [
    { id: "cortar", texto: "🛡️ Corta la jugada", atributo: "estadoFisico" },
    { id: "cuerpo", texto: "💪 Protege el área", atributo: "moral" },
    { id: "subir", texto: "⚡ Se suma al ataque", atributo: "forma" }
  ];
  if (pos === "MED") return [
    { id: "pase", texto: "➡️ Pase filtrado", atributo: "forma" },
    { id: "encara", texto: "⚡ Encara", atributo: "moral" },
    { id: "pared", texto: "🏃 Juega la pared", atributo: "estadoFisico" }
  ];
  return [
    { id: "encara", texto: "⚡ Encara", atributo: "moral" },
    { id: "remata", texto: "🎯 Remata", atributo: "forma" },
    { id: "pase", texto: "➡️ Pase", atributo: "estadoFisico" },
    { id: "desmarque", texto: "🏃 Desmarque", atributo: "forma" },
    { id: "protege", texto: "🛡️ Protege la pelota", atributo: "moral" }
  ];
}

function resolverMomentoClave(situacion, decision, callback) {
  if (!situacion) return;
  const contexto = String(situacion.contexto || "normal");
  const esDefensaCorner = situacion.posicion === "DEF" && contexto === "córner ofensivo";
  const permitido = !(situacion.posicion === "DEF" && contexto === "córner ofensivo" && !situacion.tieneCantonOfensivo);
  const tieneContextoValido = !esDefensaCorner || permitido;

  const base = Number(situacion.exitoBase) || 0.55;
  const exito = tieneContextoValido && Math.random() < base;

  let bonus = { goles: 0, asistencias: 0, partidos: 0, gol: 0 };
  if (situacion.posicion === "GK") {
    bonus.asistencias = exito ? 1 : 0;
  } else if (situacion.posicion === "DEF") {
    bonus.goles = exito && contexto === "córner ofensivo" ? 1 : 0;
    bonus.asistencias = exito && contexto !== "córner ofensivo" ? 1 : 0;
  } else if (situacion.posicion === "MED") {
    bonus.asistencias = exito ? 1 : 0;
  } else {
    bonus.goles = exito ? 1 : 0;
  }

  const textoFinal = exito
    ? `${situacion.titulo}: ¡la decisión fue correcta! El equipo saco ventaja del momento y sumó ${bonus.goles ? "un gol" : bonus.asistencias ? "una asistencia" : "valor"}.`
    : `${situacion.titulo}: no explotaste del todo el momento; el rival se quedó con la iniciativa.`;

  if (typeof callback === "function") {
    callback({
      exito,
      texto: textoFinal,
      bonus,
      situacion,
      decision
    });
  }
}

function abrirModalPartidoInteractivo(situacion, callback) {
  const detalle = situacion || generarMomentoClave();
  const partido = detalle.esPartidoInteractivo ? detalle : generarPartidoInteractivo();
  const cuerpo = document.getElementById("partidoInteractivoTexto");
  const titulo = document.getElementById("modalPartidoInteractivoTitulo");
  if (cuerpo) cuerpo.innerHTML =
    `<strong>⚽ ${partido.club.nombre} ${partido.local ? "(Local)" : "(Visitante)"} vs ${partido.rival.nombre}</strong><br>` +
    `<span>🏆 ${partido.competencia} · ${partido.importancia}</span><br>` +
    `<span>👤 ${partido.posicion} · ${partido.titular ? "Titular" : "Suplente"} · OVR ${partido.ovr}</span><br>` +
    `<span>💪 Físico ${partido.estadoFisico} · 🧠 Moral ${partido.moral} · 📈 Forma ${partido.forma}</span><br><br>` +
    `El partido avanzará por momentos decisivos. Tus decisiones tendrán consecuencias reales.`;
  if (titulo) titulo.innerText = "⚽ Partido Importante";
  estadoPartidoEspecial = {
    partido,
    situacion: Object.assign({}, partido, { posicion: (jugador && jugador.posicion) || "DEL" }),
    callback: typeof callback === "function" ? callback : null
  };
  const botones = document.querySelectorAll("#modalPartidoInteractivo .modal-body button");
  if (botones[1]) botones[1].style.display = "none";
  if (modalPartidoInteractivoInstance) modalPartidoInteractivoInstance.show();
}

function resolverDecisionPartido(accion) {
  const estado = estadoPartidoEspecial;
  const partido = estado && estado.partido;
  if (!partido) return;
  const evento = partido.eventos[partido.indiceEvento];
  const datos = Number(partido[accion.atributo] || 50);
  const ventajaPosicion = partido.posicion === "DEL" && accion.id === "remata" ? 0.12
    : partido.posicion === "MED" && accion.id === "pase" ? 0.10
      : partido.posicion === "DEF" && accion.id === "cortar" ? 0.12
        : partido.posicion === "GK" && accion.id === "palo" ? 0.10 : 0;
  const dificultad = evento.titulo === "Ataque rival" || evento.titulo === "Último ataque" ? 0.08 : 0;
  const probabilidad = Math.max(0.18, Math.min(0.90, 0.25 + datos / 180 + ventajaPosicion - dificultad));
  const exito = Math.random() < probabilidad;
  let consecuencia = "La jugada no terminó en gol.";
  if (exito && (accion.id === "remata" || accion.id === "subir" || accion.id === "encara")) {
    partido.goles++;
    partido.marcador.club++;
    consecuencia = "¡Oportunidad de gol y definición!";
  } else if (exito && (accion.id === "pase" || accion.id === "pared" || accion.id === "desmarque")) {
    partido.asistencias++;
    partido.marcador.club++;
    consecuencia = "Encontraste una mejor posición, generaste una asistencia y el equipo convirtió.";
  } else if (exito && (partido.posicion === "GK" || partido.posicion === "DEF")) {
    consecuencia = "¡Buena intervención! El equipo se mantuvo firme.";
  } else if (!exito && (partido.posicion === "GK" || evento.titulo === "Ataque rival" || evento.titulo === "Último ataque")) {
    partido.marcador.rival++;
    consecuencia = "El rival aprovechó el espacio y convirtió.";
  }
  if (exito && (partido.posicion === "GK" || partido.posicion === "DEF")) {
    const probContra = Math.max(0.2, Math.min(0.55, 0.30 + (partido.ovr - 70) / 100));
    if (Math.random() < probContra) {
      partido.marcador.club++;
      consecuencia += " ¡Excelente trabajo defensivo, el equipo salió de contra y convirtió!";
    }
  }
  partido.acciones.push({ minuto: evento.minuto, accion: accion.id, exito, consecuencia });
  partido.indiceEvento++;
  if (partido.indiceEvento < partido.eventos.length) {
    renderizarEventoPartido();
    return;
  }
  const bonus = {
    goles: partido.goles,
    asistencias: partido.asistencias,
    partidos: 1,
    gol: partido.goles
  };
  const rendioBien = partido.goles + partido.asistencias > 0
    || ((partido.posicion === "GK" || partido.posicion === "DEF") && partido.marcador.club >= partido.marcador.rival);
  const ajusteMoral = rendioBien ? 5 : -3;
  jugador.moral = Math.max(CONFIG.MORAL_MIN, Math.min(CONFIG.MORAL_MAX, (jugador.moral || 60) + ajusteMoral));
  jugador.rachaSinPerder = partido.marcador.club >= partido.marcador.rival
    ? (jugador.rachaSinPerder || 0) + 1
    : 0;
  const resumen = `FINAL<br><br><strong>${partido.club.nombre} ${partido.marcador.club} - ${partido.marcador.rival} ${partido.rival.nombre}</strong><br><br>` +
    `👤 Tu actuación<br>⚽ ${partido.goles} gol(es)<br>🎯 ${partido.asistencias} asistencia(s)<br>⏱️ ${partido.minutos} minutos<br>📈 ${exito ? "+forma" : "Forma estable"}` +
    ((partido.posicion === "GK" || partido.posicion === "DEF") && partido.marcador.club > 0 ? `<br>⚽ El equipo convirtió ${partido.marcador.club} gol(es)` : "") +
    (jugador.rachaSinPerder > 1 ? "<br>🔥 Nueva racha" : "");
  const callback = estado.callback;
  if (modalMomentosClaveInstance) modalMomentosClaveInstance.hide();
  mostrarNotificacion("FINAL", resumen, function() {
    estadoPartidoEspecial = null;
    if (typeof callback === "function") callback({ exito: true, bonus, texto: resumen, decision: "interactivo", marcador: partido.marcador });
  });
}

function renderizarEventoPartido() {
  const estado = estadoPartidoEspecial;
  const partido = estado && estado.partido;
  if (!partido) return;
  const evento = partido.eventos[partido.indiceEvento];
  const body = document.getElementById("modalMomentosClaveCuerpo");
  const footer = document.getElementById("modalMomentosClaveFooter");
  if (!body || !evento) return;
  const acciones = accionesPartidoInteractivo(partido);
  const historial = partido.acciones.map(a => `${a.minuto}' — ${a.consecuencia}`).join("<br>");
  body.innerHTML = `<p class="small text-secondary mb-1">⚽ ${partido.club.nombre} ${partido.marcador.club} - ${partido.marcador.rival} ${partido.rival.nombre} · ⏱️ ${evento.minuto}'</p>` +
    `<p class="fw-bold mb-1">${evento.titulo}</p><p class="text-muted">${evento.descripcion}</p>` +
    (historial ? `<div class="small text-start border rounded p-2 mb-3">${historial}</div>` : "") +
    `<div class="d-grid gap-2">${acciones.map(a => `<button class="btn btn-warning fw-bold" data-accion="${a.id}" data-atributo="${a.atributo}">${a.texto}</button>`).join("")}</div>`;
  if (footer) footer.style.display = "none";
  body.querySelectorAll("button[data-accion]").forEach(btn => btn.addEventListener("click", function() {
    resolverDecisionPartido({ id: btn.dataset.accion, atributo: btn.dataset.atributo });
  }));
}

function renderizarMomentoClave(situacion) {
  const body = document.getElementById("modalMomentosClaveCuerpo");
  const footer = document.getElementById("modalMomentosClaveFooter");
  if (!body) return;
  const opciones = Array.isArray(situacion.opciones) ? situacion.opciones : ["Continuar"];
  body.innerHTML = `
    <p class="mb-2 fw-bold text-dark">${situacion.titulo}</p>
    <p class="text-muted mb-3">${situacion.descripcion}</p>
    <div class="d-grid gap-2 col-10 mx-auto">
      ${opciones.map((op, idx) => `<button class="btn btn-warning fw-bold" type="button" data-decision="${idx}">${op}</button>`).join("")}
    </div>
  `;

  if (footer) {
    footer.style.display = "none";
    footer.innerHTML = "";
  }

  body.querySelectorAll("button[data-decision]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const valor = btn.textContent.trim();
      const accion = estadoPartidoEspecial && estadoPartidoEspecial.callback;
      const moment = Object.assign({}, situacion, {
        posicion: (jugador && jugador.posicion) || "DEL",
        tieneCantonOfensivo: true
      });
      if (modalMomentosClaveInstance) modalMomentosClaveInstance.hide();
      resolverMomentoClave(moment, valor, (res) => {
        if (typeof accion === "function") accion(res);
      });
    });
  });
}

function jugarMomentosClave() {
  if (estadoPartidoEspecial && estadoPartidoEspecial.partido) {
    if (modalPartidoInteractivoInstance) modalPartidoInteractivoInstance.hide();
    document.getElementById("modalMomentosClaveTitulo").innerText = "⚡ Partido en juego";
    renderizarEventoPartido();
    modalMomentosClaveInstance.show();
    return;
  }
  const detalle = (estadoPartidoEspecial && estadoPartidoEspecial.situacion) || generarMomentoClave();
  if (modalPartidoInteractivoInstance) modalPartidoInteractivoInstance.hide();
  if (modalMomentosClaveInstance) {
    document.getElementById("modalMomentosClaveTitulo").innerText = "⚡ Momento Clave";
    renderizarMomentoClave(detalle);
    modalMomentosClaveInstance.show();
  }
}

function simularPartidoNormal() {
  const accion = estadoPartidoEspecial && estadoPartidoEspecial.callback;
  if (modalPartidoInteractivoInstance) modalPartidoInteractivoInstance.hide();
  if (typeof accion === "function") {
    accion({ exito: true, bonus: { goles: 0, asistencias: 0, partidos: 0 }, texto: "Partido normal resuelto por la simulación habitual.", decision: "simular" });
  }
}

function detectarPartidoEspecial() {
  return generarPartidoInteractivo();
}

// ============================================================
//  RESOLUCIÓN DE FINALES SEGÚN LA POSICIÓN
// ============================================================
function resolverFinalSegunPosicion(esPrimera, callback) {
  const modalCuerpo = document.querySelector("#modalPenal .modal-body");

  if (jugador.posicion === "GK") {
    modalCuerpo.innerHTML = `
      <h5>🧤 ¡DEFINICIÓN POR PENALES! (ARQUERO)</h5>
      <p>Elige hacia dónde tirarte para atajar el penal decisivo:</p>
      <div class="d-grid gap-2 col-8 mx-auto">
        <button class="btn btn-warning" onclick="patearPenal('Izquierda')">Izquierda</button>
        <button class="btn btn-warning" onclick="patearPenal('Centro')">Centro</button>
        <button class="btn btn-warning" onclick="patearPenal('Derecha')">Derecha</button>
      </div>
      <div id="penalResultado" class="mt-3" role="status" aria-live="polite"></div>
    `;
  } else if (jugador.posicion === "DEF") {
    modalCuerpo.innerHTML = `
      <h5>⚽ ¡ÚLTIMO CÓRNER DEL PARTIDO! (DEFENSA)</h5>
      <p>Elige a qué poste saltar a cabecear:</p>
      <div class="d-grid gap-2 col-8 mx-auto">
        <button class="btn btn-primary" onclick="patearPenal('Primer Poste')">Primer Poste</button>
        <button class="btn btn-primary" onclick="patearPenal('Punto Penal')">Punto Penal</button>
        <button class="btn btn-primary" onclick="patearPenal('Segundo Poste')">Segundo Poste</button>
      </div>
      <div id="penalResultado" class="mt-3" role="status" aria-live="polite"></div>
    `;
  } else {
    modalCuerpo.innerHTML = `
      <h5>⚽ ¡PENAL DECISIVO DE LA FINAL!</h5>
      <p>Elige la dirección de tu remate:</p>
      <div class="d-grid gap-2 col-8 mx-auto">
        <button class="btn btn-success" onclick="patearPenal('Izquierda')">Izquierda</button>
        <button class="btn btn-success" onclick="patearPenal('Centro')">Centro</button>
        <button class="btn btn-success" onclick="patearPenal('Derecha')">Derecha</button>
      </div>
      <div id="penalResultado" class="mt-3" role="status" aria-live="polite"></div>
    `;
  }

  estadoPenalActual = {
    exito: false,
    callback: (gano) => {
      const nombreTorneo = esPrimera ? "Primera División" : "Segunda División";
      callback(gano, nombreTorneo);
    }
  };

  document.getElementById("penalResultado").innerHTML = "";
  document.getElementById("penalFooter").style.display = "none";
  modalPenalInstance.show();
}

function patearPenal(direccionElegida) {
  // Zonas de tiro (para DEL/CM) y de arquero
  const zonasTiro = ['Izquierda', 'Centro', 'Derecha'];
  const eleccionRival = zonasTiro[Math.floor(Math.random() * zonasTiro.length)];
  const laVolo = Math.random() < Math.max(0.05, 0.35 - (jugador.media / 300));
  const resultadoDiv = document.getElementById("penalResultado");

  document.querySelectorAll("#modalPenal .modal-body button").forEach(b => b.disabled = true);

  if (jugador.posicion === "GK") {
    if (direccionElegida === eleccionRival) {
      resultadoDiv.className = "text-success fw-bold fs-5 mt-2";
      resultadoDiv.innerHTML = `🧤 ¡ATAJASTE EL PENAL EN LA ${direccionElegida.toUpperCase()}! ¡CAMPEONES!`;
      estadoPenalActual.exito = true;
      sonidoGol();
    } else {
      resultadoDiv.className = "text-danger fw-bold fs-5 mt-2";
      resultadoDiv.innerHTML = `❌ Te tiraste a la ${direccionElegida} y patearon a ${eleccionRival}. Perdieron la final.`;
      estadoPenalActual.exito = false;
      sonidoError();
    }
  } else if (jugador.posicion === "DEF") {
    if (Math.random() < (jugador.media / 120)) {
      resultadoDiv.className = "text-success fw-bold fs-5 mt-2";
      resultadoDiv.innerHTML = `⚽ ¡CABEZAZO IMPONENTE EN EL ${direccionElegida.toUpperCase()} Y GOL! ¡CAMPEONES!`;
      estadoPenalActual.exito = true;
      sonidoGol();
    } else {
      resultadoDiv.className = "text-danger fw-bold fs-5 mt-2";
      resultadoDiv.innerHTML = `❌ El cabezazo se fue rozando el travesaño. Perdieron la final.`;
      estadoPenalActual.exito = false;
      sonidoError();
    }
  } else {
    if (laVolo) {
      resultadoDiv.className = "text-danger fw-bold fs-5 mt-2";
      resultadoDiv.innerHTML = `❌ El remate se fue fuera. Perdieron la final.`;
      estadoPenalActual.exito = false;
      sonidoError();
    } else if (direccionElegida === eleccionRival) {
      resultadoDiv.className = "text-danger fw-bold fs-5 mt-2";
      resultadoDiv.innerHTML = `🧤 Atajó el arquero. Perdieron la final.`;
      estadoPenalActual.exito = false;
      sonidoError();
    } else {
      resultadoDiv.className = "text-success fw-bold fs-5 mt-2";
      resultadoDiv.innerHTML = `⚽ ¡GOOOOOOL A LA ${direccionElegida.toUpperCase()}! ¡CAMPEONES!`;
      estadoPenalActual.exito = true;
      sonidoGol();
    }
  }

  document.getElementById("penalFooter").style.display = "block";
}

function cerrarModalPenal() {
  modalPenalInstance.hide();
  if (estadoPenalActual && typeof estadoPenalActual.callback === 'function') {
    const callback = estadoPenalActual.callback;
    const exito = estadoPenalActual.exito;
    estadoPenalActual = null;
    callback(exito);
  }
}

function mostrarNotificacion(titulo, texto, callbackCierre = null) {
  document.getElementById('infoModalTitulo').innerText = titulo;
  document.getElementById('infoModalCuerpo').innerHTML = texto;

  const elModal = document.getElementById('infoModal');
  const handler = function() {
    elModal.removeEventListener('hidden.bs.modal', handler);
    if (callbackCierre) callbackCierre();
  };
  elModal.addEventListener('hidden.bs.modal', handler);

  modalInfo.show();
}

// ============================================================
//  INICIO / CONTINUAR / REINICIAR
// ============================================================
// ============================================================
//  2 DIVISIONES: Primera (1) y Segunda (2)
//  La división sigue al club: reputacion > UMBRAL_PRIMERA = Primera.
//  Se mantiene en jugador.division para que ascenso/descenso sean
//  coherentes aunque el club no cambie de reputación.
// ============================================================
function divisionSegunReputacion(rep) {
  return rep > CONFIG.UMBRAL_PRIMERA ? 1 : 2;
}

function sincronizarDivision() {
  if (jugador && jugador.clubActual) {
    jugador.division = divisionSegunReputacion(jugador.clubActual.reputacion);
  }
}

function iniciarCarrera() {
  const nombreInput = document.getElementById("input-nombre").value.trim();
  const posicionInput = document.getElementById("select-posicion").value;

  if (!nombreInput) {
    mostrarNotificacion("Atención", "Por favor, ingresa el nombre de tu jugador.");
    return;
  }

  const errores = validarDatos();
  if (errores.length > 0) {
    alert("Error de datos:\n- " + errores.join("\n- "));
    return;
  }

  jugador = crearJugadorInicial();
  jugador.nombre = nombreInput;
  jugador.posicion = posicionInput;
  const nacePromesa = Math.random() < CONFIG.PROMESA.PROB;
  // Progresión por atributos: genera un perfil coherente y la media
  // (OVR) se deriva de los atributos (65 normal / 75 promesa).
  if (typeof window.generarAtributosIniciales === "function" && typeof window.calcularOVR === "function") {
    jugador.atributos = window.generarAtributosIniciales(posicionInput, nacePromesa);
    jugador.media = window.calcularOVR(jugador.atributos, posicionInput);
  } else if (nacePromesa) {
    jugador.media = CONFIG.PROMESA.OVR_INICIAL;
  }
  const poolClubesPromesa = (CLUBES || []).filter(function(c) {
    return c && c.reputacion >= CONFIG.PROMESA.REPUTACION_MIN;
  }).sort(function(a, b) {
    return (b.reputacion || 0) - (a.reputacion || 0);
  });
  jugador.clubActual = nacePromesa && poolClubesPromesa.length > 0
    ? poolClubesPromesa[0]
    : CLUBES[Math.floor(Math.random() * CLUBES.length)];
  sincronizarDivision();
  if (nacePromesa) {
    mostrarNotificacion(
      "🌟 ¡Ha nacido una promesa!",
      "<strong>" + jugador.nombre + "</strong> llega con un talento excepcional.<br><br>" +
      "Se incorpora a <strong>" + jugador.clubActual.nombre + "</strong> con <strong>" + jugador.media + " OVR</strong> y todo el mundo ya lo mira."
    );
  }
  jugador.rolAnterior = obtenerRol(jugador.media);

  document.getElementById("pantalla-inicio").classList.add("hidden");
  document.getElementById("pantalla-juego").classList.remove("hidden");
  ocultarPanelCuenta();

  prepararSiguienteEvento();
  actualizarInterfaz();
  guardarPartida();
}

function continuarCarrera() {
  if (!cargarPartida()) {
    mostrarNotificacion("Atención", "No se encontró una partida guardada válida.");
    return;
  }

  document.getElementById("pantalla-inicio").classList.add("hidden");
  document.getElementById("pantalla-juego").classList.remove("hidden");
  ocultarPanelCuenta();

  if (jugador.carreraTerminada) {
    finalizarCarrera();
  } else {
    actualizarInterfaz();
  }
}

function reiniciarCarrera() {
  if (!confirm("¿Seguro que quieres reiniciar la carrera? Se perderá el progreso actual.")) return;
  borrarPartida();
  location.reload();
}

function ocultarPanelCuenta() {
  const panel = document.getElementById("cuenta-panel");
  if (panel) panel.hidden = true;
}

// ============================================================
//  SIMULACIÓN DE TEMPORADA
// ============================================================
// Declive de media por edad amortiguado por el rendimiento de la temporada.
// A partir de los 31 el paso del tiempo resta, pero una buena temporada
// recorta parte de esa caída: cada punto de subida por rendimiento (desde +2)
// amortigua 1 punto de declive, con tope en base-1 (el declive nunca se anula).
// Así un veterano destacado puede seguir GANANDO media por temporada y no solo
// por eventos o entrenamientos.
function declivePorEdadYRendimiento(edad, subidaRendimiento) {
  const base = calcularDecliveEdad(edad);
  if (base <= 0) return { base: 0, amortiguado: 0, efectiva: 0 };
  const rendimiento = Math.max(0, subidaRendimiento || 0);
  const amortiguado = rendimiento > 1 ? Math.max(0, Math.min(base - 1, rendimiento - 1)) : 0;
  return { base: base, amortiguado: amortiguado, efectiva: base - amortiguado };
}

// Calcula la base de la temporada simulada (partidos + rendimiento + títulos
// por estadística y declive por edad). Lo usan tanto simularTemporada como
// jugarPartidoContraRival para conservar la misma lógica en ambos caminos.
function calcularBasicoTemporada() {
  const rep = jugador.clubActual.reputacion;
  const diferenciaNivel = jugador.media - (rep * 10);

  let partidosBase = CONFIG.SIM.PARTIDOS_BASE + Math.floor(diferenciaNivel / 5);
  let partidos = Math.min(CONFIG.SIM.PARTIDOS_MAX, Math.max(CONFIG.SIM.PARTIDOS_MIN, partidosBase + Math.floor(Math.random() * CONFIG.SIM.PARTIDOS_VARIACION)));
  let factorRendimiento = Math.min(CONFIG.SIM.FACTOR_MAX, Math.max(CONFIG.SIM.FACTOR_MIN, 1 + (diferenciaNivel / 50)));

  let goles = 0, asistencias = 0;
  if (jugador.posicion === "DEL") {
    goles = Math.floor((jugador.media / 100) * partidos * (Math.random() * 0.5 + 0.3) * factorRendimiento);
    asistencias = Math.floor((jugador.media / 100) * partidos * (Math.random() * 0.25) * factorRendimiento);
  } else if (jugador.posicion === "CM") {
    goles = Math.floor((jugador.media / 100) * partidos * (Math.random() * 0.2) * factorRendimiento);
    asistencias = Math.floor((jugador.media / 100) * partidos * (Math.random() * 0.4 + 0.2) * factorRendimiento);
  } else if (jugador.posicion === "DEF") {
    goles = Math.floor(Math.random() * 3 * factorRendimiento);
    asistencias = Math.floor(Math.random() * 5 * factorRendimiento);
  } else if (jugador.posicion === "GK") {
    goles = 0;
    asistencias = Math.floor(Math.random() * 2);
  }

  let subidaRendimiento = 0;
  let participaciones = goles + asistencias;

  // Subida más accesible por temporada (umbrales más bajos y +1 a +3 OVR),
  // siempre recortada al techo del club actual (maxMedia) para no excederse.
  if (jugador.posicion === "DEL" && participaciones >= 8) subidaRendimiento = Math.floor(Math.random() * 3) + 1;
  else if (jugador.posicion === "CM" && participaciones >= 5) subidaRendimiento = Math.floor(Math.random() * 3) + 1;
  else if (jugador.posicion === "DEF" && partidos >= 16) subidaRendimiento = Math.floor(Math.random() * 3) + 1;
  else if (jugador.posicion === "GK" && partidos >= 18) subidaRendimiento = Math.floor(Math.random() * 3) + 1;

  const maxMedia = (typeof REGLAS_MEDIA !== "undefined" && REGLAS_MEDIA[rep]) || CONFIG.OVR_MAX;
  const subidaAplicada = (subidaRendimiento > 0 && jugador.media < maxMedia)
    ? Math.min(subidaRendimiento, maxMedia - jugador.media)
    : 0;
  if (subidaAplicada > 0) sumarMedia(subidaAplicada);

  // --- DECLIVE POR EDAD ---
  // Desde los 31 empieza el declive; después de los 31 se acentúa, pero el
  // rendimiento de la temporada lo amortigua (ver declivePorEdadYRendimiento).
  const declive = declivePorEdadYRendimiento(jugador.edad, subidaRendimiento);
  const bajaEdad = declive.efectiva;
  if (bajaEdad > 0) {
    sumarMedia(-Math.min(bajaEdad, jugador.media - CONFIG.OVR_MIN));
  }

  const esPrimera = jugador.division === 1 && jugador.temporadasForzadoSegunda === 0;
  let trofeosGanadosEstaTemp = [];

  if (goles >= 25 && Math.random() < 0.35) {
    jugador.trofeos.botaDeOro++;
    trofeosGanadosEstaTemp.push("👟 Bota de Oro");
  }
  if (jugador.media >= 90 && participaciones >= 22 && Math.random() < 0.25) {
    jugador.trofeos.balonDeOro++;
    trofeosGanadosEstaTemp.push("🥇 Balón de Oro");
  }

  return {
    rep,
    partidos,
    goles,
    asistencias,
    subidaRendimiento,
    subidaAplicada,
    bajaEdad,
    bajaEdadBase: declive.base,
    decliveAmortiguado: declive.amortiguado,
    esPrimera,
    trofeosGanadosEstaTemp
  };
}

// ============================================================
//  RIVALES DE LA TEMPORADA (3 partidos por temporada)
//  Cada temporada se sortean 3 equipos distintos. Puede tocarte el
//  mismo club en temporadas diferentes, pero nunca repetir dentro de
//  la misma temporada. Se juegan de a uno, cuando el jugador toque.
// ============================================================
function armarRivalesTemporada() {
  if (typeof CLUBES === "undefined" || !Array.isArray(CLUBES) || !jugador || !jugador.clubActual) return;
  const propio = jugador.clubActual.nombre;
  const rep = jugador.clubActual.reputacion || 5;
  const pool = CLUBES.filter(c => c && c.nombre && c.nombre !== propio).slice();
  pool.sort(function(a, b) {
    const da = Math.abs((a.reputacion || 5) - rep);
    const db = Math.abs((b.reputacion || 5) - rep);
    return (da - db) || (a.nombre < b.nombre ? -1 : 1);
  });
  const cortados = pool.slice(0, Math.max(3, Math.min(pool.length, 9)));
  for (let i = cortados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = cortados[i]; cortados[i] = cortados[j]; cortados[j] = tmp;
  }
  const rivales = [];
  for (let i = 0; i < cortados.length && rivales.length < 3; i++) {
    if (!rivales.some(r => r === cortados[i].nombre)) rivales.push(cortados[i].nombre);
  }
  for (let i = 0; i < pool.length && rivales.length < 3; i++) {
    if (!rivales.some(r => r === pool[i].nombre)) rivales.push(pool[i].nombre);
  }
  jugador.rivalesTemporada = rivales;
  jugador.partidosJugadosTemporada = 0;
  jugador.acumTemporada = { partidos: 0, goles: 0, asistencias: 0, ganados: 0 };
}

function clubRivalActual() {
  if (!jugador || !jugador.rivalesTemporada || !jugador.rivalesTemporada.length) return null;
  const idx = jugador.partidosJugadosTemporada || 0;
  const nombre = jugador.rivalesTemporada[idx];
  if (!nombre || typeof CLUBES === "undefined") return null;
  return CLUBES.find(c => c && c.nombre === nombre) || null;
}

// ============================================================
//  JUGAR EL PRÓXIMO PARTIDO (el del VS): uno de los 3 de la temporada
//  Juega un partido interactivo contra el rival mostrado en la tarjeta.
//  El resultado se acumula en jugador.acumTemporada. Al completar los
//  3 partidos se cierra la temporada (momentos decisivos/finales incluidos).
// ============================================================
function jugarPartidoContraRival() {
  if (!jugador || jugador.carreraTerminada) return;
  if (!jugador.rivalesTemporada || !jugador.rivalesTemporada.length) armarRivalesTemporada();
  const total = jugador.rivalesTemporada ? jugador.rivalesTemporada.length : 3;
  const idx = jugador.partidosJugadosTemporada || 0;
  if (idx >= total) { cerrarTemporadaFinalizada(); return; }
  const rival = clubRivalActual();
  const partido = generarPartidoInteractivo();
  if (!partido) return;
  if (rival && rival.nombre && (!partido.club || rival.nombre !== partido.club.nombre)) {
    partido.rival = rival;
  }
  abrirModalPartidoInteractivo(partido, function(resultado) {
    const bonus = resultado.bonus || { goles: 0, asistencias: 0, partidos: 0 };
    const a = jugador.acumTemporada || (jugador.acumTemporada = { partidos: 0, goles: 0, asistencias: 0, ganados: 0 });
    a.partidos = (a.partidos || 0) + 1;
    a.goles = (a.goles || 0) + (bonus.goles || 0);
    a.asistencias = (a.asistencias || 0) + (bonus.asistencias || 0);
    if (resultado.marcador && resultado.marcador.club > resultado.marcador.rival) a.ganados = (a.ganados || 0) + 1;
    if (typeof guardarPartida === "function") guardarPartida();
    const jugados = idx + 1;
    jugador.partidosJugadosTemporada = jugados;
    if (jugados >= total) {
      cerrarTemporadaFinalizada();
      return;
    }
    const resta = total - jugados;
    if (typeof t === "function") {
      mostrarNotificacion(t("partidoCompletado"), t("faltanPartidos").replace("{n}", String(resta)));
    } else {
      mostrarNotificacion("Partido completado", "Quedan " + resta + " partido(s) por jugar.");
    }
    if (typeof actualizarInterfaz === "function") actualizarInterfaz();
  });
}

// Cierra la temporada: simula el resto, resuelve títulos, finales
// (momentos decisivos según la posición) y copas. Suma lo ya jugado.
function cerrarTemporadaFinalizada() {
  if (!jugador || jugador.carreraTerminada) return;
  const b = calcularBasicoTemporada();
  const a = jugador.acumTemporada || { partidos: 0, goles: 0, asistencias: 0, ganados: 0 };
  jugador.rivalesTemporada = [];
  jugador.partidosJugadosTemporada = 0;
  jugador.acumTemporada = { partidos: 0, goles: 0, asistencias: 0, ganados: 0 };
  resolverCierreTemporada(
    b.partidos + (a.partidos || 0),
    b.goles + (a.goles || 0),
    b.asistencias + (a.asistencias || 0),
    b.subidaAplicada,
    b.trofeosGanadosEstaTemp,
    b.esPrimera,
    b.bajaEdad,
    (a.ganados || 0) >= 2,
    b.decliveAmortiguado
  );
}

function simularTemporada() {
  if (!jugador || jugador.carreraTerminada) return;
  if (!jugador.rivalesTemporada || !jugador.rivalesTemporada.length) armarRivalesTemporada();
  const jugados = jugador.partidosJugadosTemporada || 0;
  const total = jugador.rivalesTemporada ? jugador.rivalesTemporada.length : 3;
  if (jugados < total) {
    if (typeof t === "function") {
      mostrarNotificacion(t("partidosPendientes"), t("faltanPartidos").replace("{n}", String(total - jugados)));
    } else {
      mostrarNotificacion("Partidos pendientes", "Tenés " + (total - jugados) + " partido(s) de la temporada por jugar.");
    }
    return;
  }
  cerrarTemporadaFinalizada();
}

// ============================================================
//  SISTEMA DE TÍTULOS (por temporada)
//  - Primera:  Campeonato de Primera División, Copa Argentina y
//    Copa de Campeones (si ganaste una de las otras dos).
//  - Segunda:  Campeonato de Segunda División (+ ascenso), Copa
//    Apa y Copa de Campeones (si ganaste una de las otras dos).
//  - Se puede ganar más de un título en la misma temporada.
//  El campeonato se puede definir jugando la final según tu
//  posición (penales, arquero atajando, defensa en el último
//  córner) o de forma probabilística según la reputación del club.
// ============================================================
function concederCampeonatoLiga(trofeos, esPrimera, textoTorneo) {
  if (esPrimera) {
    jugador.trofeos.primeraDivision++;
    trofeos.push(textoTorneo || "🏆 Primera División");
  } else {
    jugador.trofeos.segundaDivision++;
    trofeos.push(textoTorneo || "🏆 Segunda División");
  }
  jugador.clubCampeonAnterior = jugador.clubActual.nombre;
}

function resolverCopasDeTemporada(trofeos, esPrimera) {
  const rep = jugador.clubActual.reputacion;

  // Copa nacional: siempre puede ganarse (multitítulo con la liga)
  if (!esPrimera) {
    if (Math.random() < Math.min(0.5, 0.10 + (jugador.media / 100) * 0.08)) {
      jugador.trofeos.copaApa++;
      trofeos.push("🍷 Copa Apa");
    }
  } else {
    if (Math.random() < Math.min(0.5, 0.06 + (rep / 10) * 0.14 + (jugador.media / 100) * 0.04)) {
      jugador.trofeos.copaArgentina++;
      trofeos.push("🇦🇷 Copa Argentina");
    }
  }

  // Copa de Campeones: SOLO si ganaste alguna de las otras dos competencias
  const ganoTituloDomestico = trofeos.some(t =>
    t.indexOf("Primera División") !== -1 || t.indexOf("Segunda División") !== -1 ||
    t.indexOf("Copa Apa") !== -1 || t.indexOf("Copa Argentina") !== -1);
  if (ganoTituloDomestico && Math.random() < Math.max(0.05, Math.min(0.5, 0.12 + (rep / 10) * 0.15 + (jugador.media / 100) * 0.05))) {
    jugador.trofeos.copaDeCampeones++;
    trofeos.push("👑 Copa de Campeones");
  }
}

function resolverCierreTemporada(partidos, goles, asistencias, subidaRendimiento, trofeosBase, esPrimera, bajaEdad = 0, ganastePartido = false, decliveAmortiguado = 0) {
  const esDelOcentrocampista = (jugador.posicion === "DEL" || jugador.posicion === "CM");
  const rep = jugador.clubActual.reputacion;
  const requiereMinijuegoDescenso = esDelOcentrocampista && rep <= 3 && Math.random() < CONFIG.SIM.PROB_MINIJUEGO_DESCENSO;
  const requiereMinijuegoTitulo = esDelOcentrocampista && Math.random() < CONFIG.SIM.PROB_MINIJUEGO_TITULO;

  const trofeos = trofeosBase.slice();

  // Las copas se resuelven al final de TODOS los caminos: permiten sumar
  // liga + copa nacional + copa de campeones en la misma temporada.
  const cerrarConCopas = () => {
    resolverCopasDeTemporada(trofeos, esPrimera);
    finalizarResumenTemporada(partidos, goles, asistencias, subidaRendimiento, trofeos, esPrimera, bajaEdad, decliveAmortiguado);
  };

  if (requiereMinijuegoDescenso) {
    iniciarMinijuegoDecisivoTemporada("DESCENSO", (salvo) => {
      if (!salvo) jugador.temporadasForzadoSegunda = 2;
      cerrarConCopas();
    });
    return;
  }

  if (requiereMinijuegoTitulo) {
    iniciarMinijuegoDecisivoTemporada("TITULO", (gano) => {
      if (gano) concederCampeonatoLiga(trofeos, esPrimera);
      cerrarConCopas();
    });
    return;
  }

  // Definir el campeonato: final según la posición (ganar el partido
  // importante sube la chance) o campeón por reputación sin jugarlo.
  const probFinal = Math.min(0.8, CONFIG.SIM.PROB_FINAL_TORNEO + (ganastePartido ? 0.20 : 0));
  if (Math.random() < probFinal) {
    resolverFinalSegunPosicion(esPrimera, (ganoFinal, torneo) => {
      if (ganoFinal) concederCampeonatoLiga(trofeos, esPrimera, `🏆 ${torneo}`);
      cerrarConCopas();
    });
    return;
  }

  // Campeón de liga según la reputación, al azar pero con lógica
  const probCampeonato = !esPrimera
    ? (0.03 + (rep / CONFIG.UMBRAL_PRIMERA) * 0.17 + (jugador.media / 100) * 0.06)
    : (((rep - CONFIG.UMBRAL_PRIMERA) / 5) * 0.28 + (jugador.media / 100) * 0.05);
  if (Math.random() < probCampeonato) {
    concederCampeonatoLiga(trofeos, esPrimera);
  }

  cerrarConCopas();
}

function finalizarResumenTemporada(partidos, goles, asistencias, subidaAplicada, trofeosGanadosEstaTemp, esPrimera, bajaEdad = 0, decliveAmortiguado = 0) {
  const divTexto = esPrimera ? "Primera" : "Segunda";

  // ---- MOVIMIENTOS DE DIVISIÓN (2 ascienden de Segunda, 2 descienden de Primera) ----
  const rep = jugador.clubActual.reputacion;
  const esCampeonSegunda = trofeosGanadosEstaTemp.some(t => t.includes("Segunda División"));
  const esCampeonPrimera = trofeosGanadosEstaTemp.some(t => t.includes("Primera División"));
  let causoAscenso = false;
  let causoDescenso = false;

  if (!esPrimera) {
    // En Segunda: el campeón asciende siempre. Si no sos campeón, podés ser uno
    // de los 2 que suben según cuán fuerte es el club (reputación + tu nivel).
    if (esCampeonSegunda) {
      causoAscenso = true;
    } else {
      const probAscenso = Math.max(0.05, Math.min(0.45,
        (rep / CONFIG.UMBRAL_PRIMERA) * 0.14 + (jugador.media / 100) * 0.12 + (partidos >= CONFIG.SIM.PARTIDOS_MAX ? 0.04 : 0)));
      if (Math.random() < probAscenso) causoAscenso = true;
    }
    if (causoAscenso) {
      jugador.division = 1;
      if (!esCampeonSegunda) {
        trofeosGanadosEstaTemp.push("🆙 Ascenso obtenido");
      }
    }
  } else if (!esCampeonPrimera) {
    // En Primera: si no salís campeón, hay riesgo de ser uno de los 2 que baja.
    const probDescenso = Math.max(0.02, Math.min(0.38,
      ((CONFIG.UMBRAL_PRIMERA + 1 - rep) / 5) * 0.28 + (1 - jugador.media / 100) * 0.14));
    if (Math.random() < probDescenso) {
      causoDescenso = true;
      jugador.division = 2;
      jugador.temporadasForzadoSegunda = 2;
    }
  }

  jugador.historialTemporadas.push({
    temporada: jugador.temporadaActual,
    club: `${jugador.clubActual.nombre} (${divTexto})`,
    partidos: partidos,
    goles: goles,
    asistencias: asistencias,
    media: jugador.media,
    trofeos: trofeosGanadosEstaTemp.length > 0 ? trofeosGanadosEstaTemp.join(", ") : "Ninguno"
  });

  if (typeof generarRedesDespuesPartido === "function") generarRedesDespuesPartido();

  jugador.entrenamientosUsadosEstaTemporada = 0;
  jugador.minijuegosUsadosEstaTemporada = 0;
  jugador.edad++;

  if (jugador.edad >= CONFIG.EDAD_RETIRO) {
    guardarPartida();
    finalizarCarrera();
    return;
  }

  let textoResumen = `<strong>Partidos:</strong> ${partidos} <br> <strong>Goles:</strong> ${goles} <br> <strong>Asistencias:</strong> ${asistencias}<br><br>`;

  if (trofeosGanadosEstaTemp.length > 0) {
    textoResumen += `<strong>¡Títulos Obtenidos!</strong><br><span class="text-warning fw-bold">${trofeosGanadosEstaTemp.join("<br>")}</span><br><br>`;
  } else {
    textoResumen += `<span class="text-secondary">Sin títulos esta temporada.</span><br><br>`;
  }

  if (causoAscenso) {
    textoResumen += `<span class="text-success fw-bold">🆙 ¡Ascenso a Primera División!</span><br>`;
  }
  if (causoDescenso) {
    textoResumen += `<span class="text-danger fw-bold">⬇️ Descendiste a Segunda División.</span><br>`;
  }

  if (subidaAplicada > 0) {
    textoResumen += `<span class="text-success fw-bold">¡Destacado! +${subidaAplicada} OVR</span><br>`;
  }
  if (bajaEdad > 0) {
    textoResumen += `<span class="text-danger fw-bold">📉 Declive físico por edad: -${bajaEdad} OVR</span><br>`;
  }
  if (decliveAmortiguado > 0) {
    textoResumen += `<span class="text-success fw-bold">💪 Tu rendimiento amortiguó ${decliveAmortiguado} punto${decliveAmortiguado === 1 ? "" : "s"} del declive por edad.</span><br>`;
  }

  if (jugador.temporadasForzadoSegunda > 0 && !causoDescenso) {
    jugador.temporadasForzadoSegunda--;
  }

  guardarPartida();
  mostrarNotificacion(`Resumen Temp. ${jugador.temporadaActual}`, textoResumen, () => {
    verificarCambioRol();
    generarOfertasDeFichaje(causoAscenso);
  });
}

function generarOfertasDeFichaje(ascendio = false) {
  let candidatos = CLUBES.filter(c => c.nombre !== jugador.clubActual.nombre);

  if (jugador.temporadasForzadoSegunda > 0) {
    // Descenso o Sanción Loro: solo clubes de Segunda División
    candidatos = candidatos.filter(c => c.reputacion <= CONFIG.UMBRAL_PRIMERA);
    ofertasActuales = [
      jugador.clubActual,
      candidatos[0] || CLUBES[0],
      candidatos[1] || CLUBES[1]
    ];
  } else if (ascendio) {
    // Ascendió (por título o por clasificación): solo clubes de Primera División
    candidatos = candidatos.filter(c => c.reputacion > CONFIG.UMBRAL_PRIMERA);
    ofertasActuales = [
      jugador.clubActual,
      candidatos[0] || CLUBES[0],
      candidatos[1] || CLUBES[1]
    ];
  } else if (ofertasAleatoriasPorEdad(jugador.edad)) {
    // Veterano (más de 31): los equipos llegan más al azar, sin filtro por media.
    candidatos.sort(() => Math.random() - 0.5);
    ofertasActuales = armarTresOfertas(candidatos, jugador.clubActual);
  } else {
    // Rangos coherentes según la media (ver rangoReputacionPorMedia en data.js)
    const rango = rangoReputacionPorMedia(jugador.media);
    const dentroRango = candidatos.filter(c => c.reputacion >= rango.min && c.reputacion <= rango.max);
    // Si el rango quedara vacío por alguna razón, se usa el pool completo.
    const pool = (dentroRango.length > 0 ? dentroRango : candidatos).sort(() => Math.random() - 0.5);
    ofertasActuales = armarTresOfertas(pool, jugador.clubActual);
  }

  document.getElementById('fichajes-temp').innerText = jugador.temporadaActual + 1;
  const contenedor = document.getElementById("contenedor-ofertas");
  contenedor.innerHTML = "";

  if (jugador.temporadasForzadoSegunda > 0) {
    const alerta = document.createElement("div");
    alerta.className = "alert alert-danger p-2 small mb-3";
    alerta.innerHTML = `⚠️ <strong>Obligado en Segunda:</strong> por descenso o sanción solo podés renovar en Segunda o fichar en clubes de Segunda.`;
    contenedor.appendChild(alerta);
  } else if (ascendio) {
    const alerta = document.createElement("div");
    alerta.className = "alert alert-success p-2 small mb-3";
    alerta.innerHTML = `🆙 <strong>¡Ascendiste a Primera!</strong> Solo podés renovar o fichar en clubes de Primera División.`;
    contenedor.appendChild(alerta);
  }

  // Nota explicativa: coherencia de las ofertas con la media y la edad
  const nota = document.createElement("div");
  nota.className = "alert alert-light border p-2 small mb-3";
  if (ofertasAleatoriasPorEdad(jugador.edad) && jugador.temporadasForzadoSegunda === 0) {
    nota.innerHTML = `🎲 A tu edad (<strong>${jugador.edad}</strong>), los equipos te llaman de forma más aleatoria: ya no siguen del todo tu media.`;
    } else {
    nota.innerHTML = '';
  }
  contenedor.appendChild(nota);

  ofertasActuales.forEach((club) => {
    const esClubPrimera = club.reputacion > CONFIG.UMBRAL_PRIMERA
      || (club.nombre === jugador.clubActual.nombre && jugador.division === 1);
    const etiquetaDiv = esClubPrimera ? " [Primera]" : " [Segunda]";
    const esRenovacion = (club.nombre === jugador.clubActual.nombre && jugador.temporadasForzadoSegunda === 0);

    const btn = document.createElement("button");
    btn.className = esRenovacion ? "btn btn-outline-primary py-2 mb-2 w-100" : "btn btn-pso py-2 mb-2 w-100";

    btn.innerHTML = esRenovacion
      ? `<strong>Renovar:</strong> ${club.nombre} <small class="text-info">${etiquetaDiv}</small>`
      : `<strong>Fichar:</strong> ${club.nombre} <small class="text-warning">${etiquetaDiv}</small>`;

    btn.onclick = () => seleccionarOferta(club);
    contenedor.appendChild(btn);
  });

  modalFichajes.show();
}

function seleccionarOferta(clubElegido) {
  jugador.clubActual = clubElegido;
  sincronizarDivision();
  modalFichajes.hide();
  jugador.temporadaActual++;

  verificarCondicionLoro();
  recuperarRangoNittox();
  prepararSiguienteEvento();
  actualizarInterfaz();
  guardarPartida();
}

function abrirModalEvento() {
  if (!jugador.eventoDisponibleActual) return;

  const evConfig = eventoEnIdioma(configsEventos[jugador.eventoDisponibleActual]);
  document.getElementById("decisionModalTitulo").innerText = evConfig.titulo;
  document.getElementById("decisionModalCuerpo").innerHTML = evConfig.texto;

  const elModal = document.getElementById("decisionModal");
  const footer = elModal.querySelector(".modal-footer");
  let respuestaTomada = false;

  if (evConfig.dosOpciones) {
    // Eventos con DOS opciones explícitas (CERBE, NERVA, NITTOX, PRIMOS...)
    footer.innerHTML = "";
    const btnA = document.createElement("button");
    btnA.className = "btn btn-warning fw-bold";
    btnA.innerText = evConfig.dosOpciones.a.texto;
    btnA.onclick = () => {
      respuestaTomada = true;
      modalDecision.hide();
      resolverEventoDosOpciones(jugador.eventoDisponibleActual, "a");
    };
    const btnB = document.createElement("button");
    btnB.className = "btn btn-secondary fw-bold";
    btnB.innerText = evConfig.dosOpciones.b.texto;
    btnB.onclick = () => {
      respuestaTomada = true;
      modalDecision.hide();
      resolverEventoDosOpciones(jugador.eventoDisponibleActual, "b");
    };
    footer.appendChild(btnA);
    footer.appendChild(btnB);
  } else if (evConfig.sinRechazo) {
    // Evento obligatorio (ACUSADO): no se puede rechazar, la única salida es el SS.
    footer.innerHTML = "";
    const btnOk = document.createElement("button");
    btnOk.className = "btn btn-danger fw-bold";
    btnOk.innerText = "🖥️ Someterse al SS";
    btnOk.onclick = () => {
      respuestaTomada = true;
      modalDecision.hide();
      resolverEvento(true);
    };
    footer.appendChild(btnOk);
  } else if (jugador.eventoDisponibleActual === "PIPITA") {
    // Evento especial con DOS opciones: piña o dejarse boquear
    footer.innerHTML = "";
    const btnPina = document.createElement("button");
    btnPina.className = "btn btn-danger fw-bold";
    btnPina.innerText = "🥊 LE PEGO UNA PIÑA";
    btnPina.onclick = () => {
      respuestaTomada = true;
      modalDecision.hide();
      resolverEventoPipita("pina");
    };
    const btnBoquear = document.createElement("button");
    btnBoquear.className = "btn btn-secondary fw-bold";
    btnBoquear.innerText = "😐 Me dejo boquear";
    btnBoquear.onclick = () => {
      respuestaTomada = true;
      modalDecision.hide();
      resolverEventoPipita("boquear");
    };
    footer.appendChild(btnPina);
    footer.appendChild(btnBoquear);
  } else {
    // Restaurar los botones por defecto (por si PIPITA los reemplazó antes)
    footer.innerHTML = '<button class="btn btn-secondary" data-bs-dismiss="modal">Rechazar</button><button class="btn btn-warning fw-bold" id="btn-aceptar-evento">Aceptar</button>';

    const btnAceptar = document.getElementById("btn-aceptar-evento");
    const nuevoBtn = btnAceptar.cloneNode(true);
    btnAceptar.parentNode.replaceChild(nuevoBtn, btnAceptar);

    nuevoBtn.onclick = () => {
      respuestaTomada = true;
      modalDecision.hide();
      resolverEvento(true);
    };
  }

  const rechazoHandler = function() {
    elModal.removeEventListener('hidden.bs.modal', rechazoHandler);
    if (!respuestaTomada) {
      if (evConfig.sinRechazo) {
        // Evento obligatorio (ACUSADO): cerrar el modal no lo esquiva.
        resolverEvento(true);
        return;
      }
      resolverEvento(false);
    }
  };

  elModal.addEventListener('hidden.bs.modal', rechazoHandler);
  modalDecision.show();
}

function resolverEvento(acepta) {
  let resultadoTxt = "";
  const evento = jugador.eventoDisponibleActual;
  const evCfg = configsEventos[evento];
  let peleaTrasEvento = false;

  if (jugador.eventoDisponibleActual === "RANKEDS") {
    if (acepta) {
      sumarMedia(-1);
      resultadoTxt = "Sumas horas innecesarias por unas monedas y no mejoras (-1 OVR).";
    } else {
      sumarMedia(2);
      resultadoTxt = "Utilizas tu tiempo para jugar mix (+2 OVR).";
    }
    registrarEventoFinalizado();
    setTimeout(() => { mostrarNotificacion("Resultado de Rankeds", resultadoTxt); }, CONFIG.TIMING.AVISO_EVENTO_MS);
    return;
  }

  if (jugador.eventoDisponibleActual === "PIEDRA") {
    if (acepta) {
      sumarMedia(3);
      resultadoTxt = "Aprendiste mucho de Piedra y mejoras tu juego (+3 OVR).";
    } else {
      sumarMedia(-2);
      resultadoTxt = "Perdiste la oportunidad de aprender de Piedra (-2 OVR).";
    }
    registrarEventoFinalizado();
    setTimeout(() => { mostrarNotificacion("Resultado de Piedra", resultadoTxt); }, CONFIG.TIMING.AVISO_EVENTO_MS);
    return;
  }

  if (!acepta) {
    resultadoTxt = (evCfg && evCfg.textoRechazo) ? evCfg.textoRechazo : "Decidiste enfocarte y rechazaste la propuesta.";
    registrarEventoFinalizado();
    setTimeout(() => {
      mostrarNotificacion("Resultado del Evento", resultadoTxt, () => {
        verificarCambioRol();
        actualizarInterfaz();
      });
    }, CONFIG.TIMING.AVISO_EVENTO_MS);
  } else {
    if (jugador.eventoDisponibleActual === "RICKY") {
      registrarEventoFinalizado();
      ejecutarScreenShare();
      return;
    }

    const random = Math.random();
    switch (jugador.eventoDisponibleActual) {
      case "SOSSA":
        if (random <= 0.5) { sumarMedia(4); resultadoTxt = "Se pico en Dorian, te fuiste con una y rendiste mas en el entrenamiento (+4 OVR)."; }
        else {
          sumarMedia(-3);
          resultadoTxt = "Hubo bondi en Dorian, te cagaron a palo (-3 OVR).<br><br>🥊 ¡Y te quieren pegar! Defendete.";
          peleaTrasEvento = true;
        }
        break;
      case "BANDIDO":
        if (random <= 0.5) resultadoTxt = "¡Efecto mágico! Volás en la cancha.";
        else resultadoTxt = "Te cayó pesado y andás lento (Era Paraguayo).";
        break;
      case "DNT":
        if (random <= 0.4) { sumarMedia(3); resultadoTxt = "¡Aprendiste el futbol de CALA! (+3 OVR)."; }
        else { sumarMedia(-2); resultadoTxt = "El dicta te re cago a puteadas, te fuiste con la moral baja (-2 OVR)."; }
        break;
      case "NACHO_LV":
        if (random <= 0.5) { sumarMedia(4); resultadoTxt = "¡Excelente entreno con las Varillas! (+4 OVR)."; }
        else { sumarMedia(-3); resultadoTxt = "Entreno cansador (-3 OVR)."; }
        break;
      case "VALIEL":
        if (random <= 0.4) {
          sumarMedia(5);
          jugador.rolForzado = "Aspirante";
          resultadoTxt = "🔥 ¡Pasaste las pruebas de Valiel! Sos oficialmente <strong>ASPIRANTE</strong> sí o sí (+5 OVR).";
        } else {
          resultadoTxt = "No lograste superar las pruebas de Valiel esta vez.";
        }
        break;
      case "CHAGAS":
        if (random <= 0.5) {
          sumarMedia(2);
          resultadoTxt = "¡La cena estuvo excelente y saludable! (+2 OVR)";
        } else {
          sumarMedia(-2);
          resultadoTxt = "La comida te cayó bastante mal (-2 OVR).";
        }
        break;
      case "CASANA":
        if (random <= 0.4) {
          sumarMedia(3);
          resultadoTxt = "¡Jugar IOSOCCER te ayudó a mejorar en el PSO! (+3 OVR)";
        } else {
          sumarMedia(-2);
          resultadoTxt = "Perdiste tiempo valioso jugando IOSOCCER (-2 OVR).";
        }
        break;
      case "BEKKU":
        if (random <= 0.5) {
          sumarMedia(2);
          resultadoTxt = "Bekku te ayuda a ganar la mix (+2 OVR)";
        } else {
          sumarMedia(-2);
          resultadoTxt = "Bekku te trolea todo y pierden la mix y te comes 4adv (-2 OVR).";
        }
        break;
      case "CARNICERO":
        if (random <= 0.4) {
          sumarMedia(2);
          resultadoTxt = "El Carnicero Neuquino te da una dieta a base de carne y mejoras (+2 OVR)";
        } else {
          sumarMedia(-2);
          resultadoTxt = "La carne estaba toda vencida, te cayo mal (-2 OVR).";
        }
        break;
      case "KULONETA":
        if (random <= 0.5) { cambiarMoral(15); resultadoTxt = "🤝 Te haces amigo de ellos (+15 de moral)."; }
        else { cambiarMoral(-15); resultadoTxt = "😖 Salis traumado del discord (-15 de moral)."; }
        break;
      case "MACHI":
        if (random <= 0.5) { sumarMedia(2); resultadoTxt = "🌀 Aprendiste los giros de Machi (+2 OVR)."; }
        else { resultadoTxt = "🙃 No servis para los giritos."; }
        break;
      case "NOZ":
        if (random <= 0.5) { sumarMedia(2); cambiarMoral(10); resultadoTxt = "🍺 Buena salida con Noz: rendís más (+2 OVR)."; }
        else { sumarMedia(-2); cambiarMoral(-10); resultadoTxt = "😴 La salida con Noz te dejó fundido y rendís mal (-2 OVR)."; }
        break;
      case "PYOJO":
        if (random <= 0.5) { sumarMedia(2); resultadoTxt = "🍸 Salis re mamado y te bailas a todos (+2 OVR)."; }
        else { sumarMedia(-2); resultadoTxt = "🥴 Saliste todo quebrado y no te podes ni parar (-2 OVR)."; }
        break;
      case "ORSINI":
        resultadoTxt = "🌼 Jugás unas mixs con Orsini. Ni bien ni mal, buena compañía.";
        break;
      case "NICOBAILARIN":
        if (random <= 0.5) { sumarMedia(1); resultadoTxt = "🕺 Mejoras tu movimiento de cadera y te ayuda a Dribblear mejor (+1 OVR)."; }
        else { sumarMedia(-1); resultadoTxt = "💃 Salio mal el baile y te lastimaste (-1 OVR)."; }
        break;
      case "RONNIE":
        sumarMedia(2);
        resultadoTxt = "📚 Aprendes las habilidades de Ronnie y Flowy (+2 OVR).";
        break;
      case "BAREIRO": {
        if (!jugador.modoDesafio) {
          const argentinos = CLUBES.find(c => c.nombre === "Argentinos Juniors");
          if (argentinos) jugador.clubActual = argentinos;
        }
        sincronizarDivision();
        resultadoTxt = "🔴⚪ ¡Te vas a jugar a Argentinos Juniors con Bareiro! Cambio de club inmediato.";
        break;
      }
      case "MUSA":
        sumarMedia(1);
        resultadoTxt = "🐴 Vas a entrenar con Musa (+1 OVR).";
        break;
      case "KOLT":
        if (random <= 0.5) { cambiarMoral(10); resultadoTxt = "❄️ Gran finde con Kolt (+10 de moral)."; }
        else { sumarMedia(-2); resultadoTxt = "🥶 Te cagaste de frio y te enfermaste (-2 OVR)."; }
        break;
      case "VIEJO":
        if (random <= 0.5) { sumarMedia(1); resultadoTxt = "🎮 Incrementan tus habilidades (+1 OVR)."; }
        else { sumarMedia(-2); resultadoTxt = "⏳ Perdiste tiempo al pedo (-2 OVR)."; }
        break;
      case "PISA":
        if (random <= 0.5) { sumarMedia(2); resultadoTxt = "🎯 Mejoras tu habilidad de Pase (+2 OVR)."; }
        else { sumarMedia(-2); resultadoTxt = "😈 Te putea todo Impalare y te doxean (-2 OVR)."; }
        break;
      case "PERUANOS":
        if (random <= 0.5) { sumarMedia(2); resultadoTxt = "🇵🇪 Ganas el ofi desde Peru, nada te para (+2 OVR)."; }
        else { sumarMedia(-1); resultadoTxt = "📡 El ping te mato y perdieron (-1 OVR)."; }
        break;
      case "PUSKAS":
        if (random <= 0.5) { sumarMedia(3); resultadoTxt = "🖥️ Mejoras mucho gracias a los componentes (+3 OVR)."; }
        else { sumarMedia(-3); resultadoTxt = "🔧 Estaban rotos y dejaste de jugar por un tiempo (-3 OVR)."; }
        break;
      case "GLIZZI":
        sumarMedia(1);
        resultadoTxt = "😄 Vos le enseñaste a él al final (+1 OVR).";
        break;
      case "PASO":
        cambiarMoral(10);
        resultadoTxt = "⛏️ Vas a jugar al Terraria con ellos. ¡HICISITE UNA BUENA ELECCION! (+10 de moral)";
        break;
      case "MATUTE": {
        if (!jugador.modoDesafio) {
          const chaco = CLUBES.find(c => c.nombre === "Chaco For Ever");
          if (chaco) jugador.clubActual = chaco;
        }
        sincronizarDivision();
        resultadoTxt = "🌰 Vas a jugar a Chaco For Ever. Equipo donde salieron grandes jugadores.";
        break;
      }

      case "KROSTY": {
        const hasbulitah = CLUBES.find(c => c.nombre === "Hasbullitah");
        if (hasbulitah) jugador.clubActual = hasbulitah;
        sincronizarDivision();
        resultadoTxt = "🧔 Aceptaste la invitación rara: cambiaste de equipo a Hasbullitah.";
        break;
      }

      case "COCCARO": {
        // Coccaro: te llevás por la guita a Laferrere. En Modo Desafío no hay
        // cambio de club (estás fichado para siempre), pero sí la penalidad.
        if (!jugador.modoDesafio) {
          const laferrere = CLUBES.find(c => c.nombre === "Laferrere");
          if (laferrere) jugador.clubActual = laferrere;
        }
        sincronizarDivision();
        sumarMedia(-3);
        resultadoTxt = "💰 Te fuiste por la guita: -3 OVR. Cambiaste a Laferrere.";
        break;
      }

      case "CHILE": {
        if (random <= 0.5) {
          sumarMedia(3);
          resultadoTxt = "🇨🇱 Tiembla mientras jugás con Mati, pero él ni se levanta. Aprendés a mantener la calma bajo presión (+3 OVR).";
        } else {
          sumarMedia(-3);
          resultadoTxt = "🇨🇱 Vas, no le entendés a nadie y tiembla todo (-3 OVR).";
        }
        break;
      }

      case "ACUSADO": {
        // Evento obligatorio: el SS se ejecuta sí o sí. "Sí" y "cerrar el
        // modal" terminan acá.
        registrarEventoFinalizado();
        ejecutarAcusacionCheats();
        return;
      }
    }

    registrarEventoFinalizado();
    setTimeout(() => {
      mostrarNotificacion("Resultado del Evento", resultadoTxt, () => {
        if (peleaTrasEvento) {
          iniciarMinijuegoPelea();
        } else {
          verificarCambioRol();
          actualizarInterfaz();
        }
      });
    }, CONFIG.TIMING.AVISO_EVENTO_MS);
    return;
  }
}

// ------------------------------------------------------------
//  EVENTO ESPECIAL PIPITA (dos opciones)
// ------------------------------------------------------------
function resolverEventoPipita(opcion) {
  let resultadoTxt = "";

  if (opcion === "pina") {
    cambiarMoral(15);
    if (Math.random() < 0.5) {
      sumarMedia(-3);
      resultadoTxt = "🥊 ¡Le pegaste una PIÑA a Pipita! Te sube la moral (+15), pero te vieron y te sancionaron (-3 OVR).";
    } else {
      resultadoTxt = "🥊 ¡Le pegaste una PIÑA a Pipita! Nadie vio nada y te sentis un campeón (+15 de moral).";
    }
  } else {
    resultadoTxt = "😐 Te dejaste boquear con los títulos de Pipita. No pasa nada.";
  }

  registrarEventoFinalizado();
  setTimeout(() => {
    mostrarNotificacion("Titulos Pipa", resultadoTxt, () => {
      verificarCambioRol();
      actualizarInterfaz();
    });
  }, CONFIG.TIMING.AVISO_EVENTO_MS);
}

// ============================================================
//  EVENTOS NUEVOS V2 CON DOS OPCIONES (CERBE, NERVA, NITTOX, PRIMOS)
// ============================================================
function resolverEventoDosOpciones(id, opcion) {
  let resultadoTxt = "";

  switch (id) {
    case "CERBE":
      if (opcion === "a") {
        // Se la tirás: se queda solo y la erra.
        sumarMedia(-1);
        resultadoTxt = "⚽ Se la tiraste... lo dejaste SOLO frente al arco y Cerbe la erró el gol (-1 OVR).";
      } else {
        // No se la tirás: te mete en el collage de caras.
        cambiarMoral(-15);
        resultadoTxt = "🤣 No se la tiraste y Cerbe te metió en el Collage de caras (-15 de moral).";
      }
      break;

    case "NERVA":
      if (opcion === "a") {
        // Doxeás a los dos: Navarro te felicita.
        cambiarMoral(15);
        resultadoTxt = "📽️ Doxeaste la pelea: filtraste la cara de ambos. Navarro te felicita (+15 de moral).";
      } else {
        // No hacés nada: Nerva se revela y te doxea a vos.
        cambiarMoral(-15);
        resultadoTxt = "🙃 No hiciste nada y Nerva se reveló: filtró TU cara en la pelea (-15 de moral).";
      }
      break;

    case "NITTOX":
      if (opcion === "a") {
        // Volvés a jugar: 50/50.
        if (Math.random() < 0.5) {
          sumarMedia(2);
          resultadoTxt = "🔥 ¡La rompiste toda! Le cerraste el orto a Nittox (+2 OVR).";
        } else {
          // Perdés el rango y volvés a Normal. La próxima temporada se recupera.
          jugador.nittoxRangoQuitado = true;
          jugador.eventoNittoxJugado = true;
          resultadoTxt = "💀 Jugaste como el ojete. ¡A jugar mix Normal! (Perdés el rango esta temporada; la próxima podés recuperarlo).";
        }
      } else {
        resultadoTxt = "😴 No jugás más hasta que a Nittox se le pase. Sin consecuencias... esta vez.";
      }
      break;

    case "PRIMOS":
      if (opcion === "a") {
        resultadoTxt = "✋ Los mandaste a cagar a Benjita y a Theo. No pasa nada.";
      } else {
        // Aceptás: te fuiste a BODO a jugar.
        const bodo = CLUBES.find(c => c.nombre === "Bodo Glimt");
        if (bodo) jugador.clubActual = bodo;
        sincronizarDivision();
        resultadoTxt = "🧑‍🤝‍🧑 Te hiciste tan amigo que te fuiste a BODO a jugar. ¡Cambio de club inmediato a Bodo Glimt!";
      }
      break;

    case "TAMBUPA":
      // Tambupa: partido de futbol 5. Aceptar puede subir OVR (con riesgo).
      if (opcion === "a") {
        if (Math.random() < 0.6) {
          sumarMedia(3);
          resultadoTxt = "🔥 ¡Te la pasaste bien en el 5 y mejoraste tu juego (+3 OVR)!";
        } else {
          sumarMedia(-2);
          resultadoTxt = "🤕 Te lastimaste en el 5 y perdiste nivel (-2 OVR).";
        }
      } else {
        resultadoTxt = "🙅 Rechazaste la invitación de Tambupa. Continuás con tu carrera.";
      }
      break;
  }

  registrarEventoFinalizado();
  setTimeout(() => {
    mostrarNotificacion("Resultado del Evento", resultadoTxt, () => {
      verificarCambioRol();
      actualizarInterfaz();
    });
  }, CONFIG.TIMING.AVISO_EVENTO_MS);
}

// ------------------------------------------------------------
//  MINIJUEGO DE PELEA (se dispara cuando la salida con Sossa sale mal)
// ------------------------------------------------------------
function iniciarMinijuegoPelea() {
  const objetivoGolpes = 10;
  const tiempoPeleaMs = 3000;
  let golpes = 0;
  let terminada = false;

  // FIX V2: guard global para que la pelea nunca quede "activada" si el
  // flujo se interrumpe (cerrar el modal, iniciar/continuar otra partida).
  peleaEstado = { activo: true };

  document.getElementById("modalDominiosTitulo").innerText = "🥊 ¡PELEA EN DORIAN!";
  document.getElementById("secuenciaObjetivo").innerText = "¡Presioná ESPACIO (o hacé clic) rapidísimo para defenderte!";
  document.getElementById("resultadoDominios").innerHTML =
    "<div id='peleaContador' class='fs-3 fw-bold text-danger'>0 / " + objetivoGolpes + "</div>" +
    "<div class='progress mt-2' style='height:14px;'><div id='barraPelea' class='progress-bar bg-danger' style='width:0%;'></div></div>";
  document.getElementById("tiempoDominiosRow").style.display = "none";
  modalDominiosInstance.show();

  const cancelarSiSeCierra = () => {
    // Si el jugador cierra el modal sin terminar, la pelea se cancela
    // (sin penalidad) y se limpian TODOS los listeners globales.
    if (!terminada) {
      terminada = true;
      peleaEstado = null;
      window.removeEventListener("keydown", manejar);
      window.removeEventListener("click", manejar);
    }
  };
  document.getElementById("modalDominios").addEventListener("hidden.bs.modal", cancelarSiSeCierra, { once: true });

  const actualizar = () => {
    const cont = document.getElementById("peleaContador");
    const barra = document.getElementById("barraPelea");
    if (cont) cont.innerText = golpes + " / " + objetivoGolpes;
    if (barra) barra.style.width = Math.min(100, (golpes / objetivoGolpes) * 100) + "%";
  };

  const finalizar = (exito) => {
    if (terminada) return;
    terminada = true;
    peleaEstado = null;
    window.removeEventListener("keydown", manejar);
    window.removeEventListener("click", manejar);
    const resDiv = document.getElementById("resultadoDominios");
    if (exito) {
      resDiv.className = "text-success fw-bold fs-5 mt-2";
      resDiv.innerText = "🥊 ¡Sobreviviste! Te defendiste como pudiste y escapaste del bondi.";
      sonidoExito();
    } else {
      resDiv.className = "text-danger fw-bold fs-5 mt-2";
      resDiv.innerText = "💥 Te rompieron al por mayor (-2 OVR extra).";
      sumarMedia(-2);
      sonidoError();
    }
    guardarPartida();
    setTimeout(() => {
      modalDominiosInstance.hide();
      verificarCambioRol();
      actualizarInterfaz();
    }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
  };

  const manejar = (e) => {
    if (terminada || !peleaEstado || !peleaEstado.activo) return;
    const esClick = e.type === "click";
    const esEspacio = e.type === "keydown" && e.code === "Space";
    if (!esClick && !esEspacio) return;
    if (esEspacio) e.preventDefault();
    golpes++;
    actualizar();
    if (golpes >= objetivoGolpes) finalizar(true);
  };

  window.addEventListener("keydown", manejar);
  window.addEventListener("click", manejar);
  setTimeout(() => { if (!terminada) finalizar(false); }, tiempoPeleaMs);
}

// ------------------------------------------------------------
//  SELECCIÓN DE EVENTOS (cada evento puede aparecer 1 vez por partida)
// ------------------------------------------------------------
const TODOS_EVENTOS = [
  "SOSSA", "RICKY", "BANDIDO", "DNT", "NACHO_LV", "VALIEL", "CHAGAS", "CASANA",
  "BEKKU", "CARNICERO", "PIEDRA", "KULONETA", "MACHI", "PIPITA", "NOZ", "PYOJO",
  "ORSINI", "NICOBAILARIN", "RONNIE", "BAREIRO", "MUSA", "KOLT", "VIEJO", "PISA",
  "PERUANOS", "PUSKAS", "GLIZZI", "PASO", "MATUTE", "RANKEDS",
  "CERBE", "NERVA", "NITTOX", "KROSTY", "PRIMOS",
  "TAMBUPA", "COCCARO", "CHILE"
];

function prepararSiguienteEvento() {
  if (sePuedeHacerEvento() && !jugador.eventoDisponibleActual) {
    if (!jugador.eventosUsados) jugador.eventosUsados = [];

    // Filtrar los eventos ya vistos en esta partida
    let pool = TODOS_EVENTOS.filter(ev => jugador.eventosUsados.indexOf(ev) === -1);
    if (jugador.eventoRankedsJugado) {
      pool = pool.filter(ev => ev !== "RANKEDS");
    }
    pool = pool.filter(ev => !(jugador.modoDesafio && (ev === "BAREIRO" || ev === "MATUTE")));

    // FIX V2: un evento con poca chance de aparecer NO puede salir de forma
    // obligatoria. ACUSADO solo entra al pool mediante una tirada extra de
    // probabilidad MUY baja y solo puede ocurrir UNA VEZ en toda la partida.
    if (!jugador.eventoAcusadoJugado && Math.random() < CONFIG.PROB_EVENTO_ACUSADO) {
      pool.push("ACUSADO");
    }

    // NITTOX es SOLO para los que tienen rango Promesa o Aspirante.
    const rolActualNombre = rolEfectivo().nombre;
    if (rolActualNombre !== "Promesa" && rolActualNombre !== "Aspirante") {
      pool = pool.filter(ev => ev !== "NITTOX");
    }

    if (pool.length === 0) return; // Ya viste todos los eventos de esta partida

    // VALIEL es más raro que el resto
    if (pool.indexOf("VALIEL") !== -1 && Math.random() >= 0.20) {
      const sinValiel = pool.filter(ev => ev !== "VALIEL");
      if (sinValiel.length > 0) pool = sinValiel;
    }

    const elegido = pool[Math.floor(Math.random() * pool.length)];
    if (elegido === "RANKEDS") {
      jugador.eventoRankedsJugado = true;
    }
    if (elegido === "ACUSADO") {
      // El evento "Acusado de cheats" solo puede salir UNA VEZ por partida.
      jugador.eventoAcusadoJugado = true;
    }
    jugador.eventosUsados.push(elegido);
    jugador.eventoDisponibleActual = elegido;
  }
}

function sePuedeHacerEvento() {
  return (jugador.temporadaActual - jugador.temporadaUltimoEvento) >= CONFIG.TEMPORADAS_ENTRE_EVENTOS;
}

function registrarEventoFinalizado() {
  jugador.temporadaUltimoEvento = jugador.temporadaActual;
  jugador.eventoDisponibleActual = null;
  actualizarInterfaz();
  guardarPartida();
}

function obtenerMentorAleatorio(pos) {
  if (typeof PERSONAJES === "undefined") return "Entrenador";
  const lista = PERSONAJES[pos] || PERSONAJES.GLOBAL;
  return lista[Math.floor(Math.random() * lista.length)];
}

function obtenerFraseEntrenamientoAtributo(attr) {
  if (typeof TEXTOS_ENTRENAMIENTO_ATRIBUTO === "undefined") return "Seguí practicando, se nota el esfuerzo.";
  const lista = TEXTOS_ENTRENAMIENTO_ATRIBUTO[attr];
  return lista ? lista[Math.floor(Math.random() * lista.length)] : "Seguí practicando, se nota el esfuerzo.";
}

// ============================================================
//  ENTRENAMIENTO POR ATRIBUTOS (sistema separado)
//  El jugador elige el atributo, ve el antes/después y la OVR.
// ============================================================
const EMOJI_ATRIBUTO = {
  VEL: "⚡", PAS: "🎯", REM: "🥅", DEF: "🛡️", REG: "🌀",
  RES: "💪", REF: "🧤", MAN: "🖐️", SAL: "🧤"
};

function entrenamientoAtributosAgotado() {
  return jugador.carreraTerminada || jugador.entrenamientosUsadosEstaTemporada >= CONFIG.ENTRENAMIENTOS_POR_TEMPORADA;
}

function abrirEntrenamientoAtributos() {
  if (!jugador.atributos || typeof window.atributosDePosicion !== "function") return;

  if (entrenamientoAtributosAgotado()) {
    if (typeof t === "function") {
      mostrarNotificacion(t("entrenamientoTitulo"), t("entrenamientoAgotado"));
    } else {
      mostrarNotificacion("Centro de Entrenamiento", "Ya entrenaste en esta temporada.");
    }
    return;
  }

  const contenedor = document.getElementById("botonesEntrenamiento");
  const resultado = document.getElementById("resultadoEntrenamiento");
  if (resultado) resultado.innerHTML = "";
  if (!contenedor) return;

  contenedor.innerHTML = "";
  window.atributosDePosicion(jugador.posicion).forEach(function(attr) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-primary fw-bold d-block w-100 mb-2 text-start";
    btn.onclick = function() { entrenarAtributoVisible(attr); };
    const nombre = (typeof window.nombreAtributo === "function") ? window.nombreAtributo(attr) : attr;
    const emoji = EMOJI_ATRIBUTO[attr] || "🎽";
    btn.innerHTML = `<span class="me-1">${emoji}</span> ${attr} — ${nombre} <span class="badge bg-primary-subtle text-primary border ms-1">${jugador.atributos[attr] != null ? jugador.atributos[attr] : "?"}</span>`;
    contenedor.appendChild(btn);
  });

  if (modalEntrenamientoAtributos) modalEntrenamientoAtributos.show();
}

function entrenarAtributoVisible(attr) {
  if (entrenamientoAtributosAgotado()) return;
  if (!jugador.atributos || typeof window.entrenarAtributo !== "function") return;

  const valorAntes = jugador.atributos[attr];
  const resultado = window.entrenarAtributo(jugador.atributos, attr, jugador.posicion);
  const contenedorBotones = document.getElementById("botonesEntrenamiento");
  const contenedorResultado = document.getElementById("resultadoEntrenamiento");

  jugador.entrenamientosUsadosEstaTemporada = 1;
  if (typeof window.calcularOVR === "function") {
    jugador.media = window.calcularOVR(jugador.atributos, jugador.posicion);
  }

  if (contenedorBotones) {
    Array.prototype.forEach.call(contenedorBotones.querySelectorAll("button"), function(b) { b.disabled = true; });
  }

  const nombre = (typeof window.nombreAtributo === "function") ? window.nombreAtributo(attr) : attr;
  const tAtributo = typeof t === "function" ? t : function(c) { return c; };

  const mentor = obtenerMentorAleatorio(jugador.posicion);
  const frase = obtenerFraseEntrenamientoAtributo(attr);
  const cita = `<p class="mb-2 text-secondary" style="font-style:italic">💬 <strong>${mentor}</strong> dice:<br><span class="fw-semibold text-dark">“${frase}”</span></p>`;

  if (contenedorResultado) {
    if (resultado.exitoso) {
      contenedorResultado.innerHTML = cita + `
        <div class="border rounded p-3 bg-success bg-opacity-10">
          <h6 class="text-center mb-2 fw-bold text-success">🎯 ${nombre.toUpperCase()}</h6>
          <p class="text-center mb-1 fs-4">
            <span class="text-muted fw-bold">${valorAntes}</span>
            <span class="mx-2 text-muted">→</span>
            <span class="fw-bold text-success">${resultado.nuevoValor}</span>
            <span class="ms-2 badge bg-success fw-bold">+${resultado.delta}</span>
          </p>
          <p class="text-center mb-0 text-secondary">${tAtributo("atributoOVR")} <span class="fw-bold text-primary">${resultado.ovrAntes} → ${resultado.ovrDespues}</span></p>
        </div>`;
      sonidoExito();
      verificarCambioRol();
    } else if (resultado.motivo === "techo") {
      contenedorResultado.innerHTML = cita + `<div class="border rounded p-3 bg-warning bg-opacity-10"><p class="text-center mb-0 fw-bold text-warning">⛔ ${tAtributo("entrenamientoTecho")}</p></div>`;
    } else {
      contenedorResultado.innerHTML = cita + `<div class="border rounded p-3 bg-warning bg-opacity-10"><p class="text-center mb-0 fw-bold text-warning">😕 ${tAtributo("entrenamientoFallido")}</p></div>`;
      sonidoError();
    }
  }

  guardarPartida();
  actualizarInterfaz();
}

// ============================================================
//  FIN DE CARRERA
// ============================================================
function finalizarCarrera() {
  jugador.carreraTerminada = true;
  guardarPartida();
  document.getElementById("pantalla-juego").classList.add("hidden");
  document.getElementById("pantalla-resumen").classList.remove("hidden");

  let totalPartidos = 0, totalGoles = 0, totalAsistencias = 0;
  const tbody = document.getElementById("tabla-resumen-body");
  tbody.innerHTML = "";

  jugador.historialTemporadas.forEach((t) => {
    totalPartidos += t.partidos;
    totalGoles += t.goles;
    totalAsistencias += t.asistencias;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.temporada}</td>
      <td>${t.club}</td>
      <td>${t.partidos}</td>
      <td>${t.goles}</td>
      <td>${t.asistencias}</td>
      <td class="fw-bold text-warning">${t.media}</td>
      <td><small class="text-warning">${t.trofeos}</small></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("resumen-nombre").innerText = jugador.nombre;
  document.getElementById("resumen-posicion").innerText = jugador.posicion;
  document.getElementById("resumen-pj").innerText = totalPartidos;
  document.getElementById("resumen-goles").innerText = totalGoles;
  document.getElementById("resumen-asist").innerText = totalAsistencias;

  const rolFinal = rolEfectivo();
  document.getElementById("resumen-rol").innerHTML = `Rol final: <span style="color:${rolFinal.color};font-weight:bold;">${rolFinal.emoji} ${rolFinal.nombre}</span>`;

  const contenedorResumen = document.getElementById("pantalla-resumen");
  let palmaresHtml = document.getElementById("vitrina-palmares");
  if (!palmaresHtml) {
    palmaresHtml = document.createElement("div");
    palmaresHtml.id = "vitrina-palmares";
    palmaresHtml.className = "card p-3 bg-dark text-white text-center mt-3 border-secondary";
    contenedorResumen.appendChild(palmaresHtml);
  }

  palmaresHtml.innerHTML = `
    <h4>Palmarés Total</h4>
    <p class="mb-1">🏆 1ª Div: <strong>${jugador.trofeos.primeraDivision}</strong> | 🏆 2ª Div: <strong>${jugador.trofeos.segundaDivision}</strong> | 👑 Cop. Campeones: <strong>${jugador.trofeos.copaDeCampeones}</strong></p>
    <p class="mb-0">🍷 Cop. Apa: <strong>${jugador.trofeos.copaApa}</strong> | 🇦🇷 Cop. Argentina: <strong>${jugador.trofeos.copaArgentina}</strong> | 👟 Botas Oro: <strong>${jugador.trofeos.botaDeOro}</strong> | 🥇 Balones Oro: <strong>${jugador.trofeos.balonDeOro}</strong></p>
  `;

  dibujarGraficoEvolucion();
}

// ============================================================
//  GRÁFICO DE EVOLUCIÓN DE MEDIA
// ============================================================
function dibujarGraficoEvolucion() {
  const contenedor = document.getElementById("pantalla-resumen");
  let canvas = document.getElementById("grafico-evolucion");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "grafico-evolucion";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Evolución de la media por temporada");
    contenedor.appendChild(canvas);
  }

  const datos = jugador.historialTemporadas.map(t => t.media);
  if (datos.length === 0) return;

  const ctx = canvas.getContext("2d");
  const ancho = canvas.clientWidth || 600;
  const alto = 160;
  canvas.width = ancho;
  canvas.height = alto;

  ctx.clearRect(0, 0, ancho, alto);

  const min = Math.min(...datos, CONFIG.OVR_MIN);
  const max = Math.max(...datos, CONFIG.OVR_MAX);
  const rango = Math.max(1, max - min);
  const pad = 20;
  const pasoX = datos.length > 1 ? (ancho - pad * 2) / (datos.length - 1) : 0;

  // Ejes
  ctx.strokeStyle = "#dee2e6";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, alto - pad);
  ctx.lineTo(ancho - pad, alto - pad);
  ctx.stroke();

  // Línea
  ctx.strokeStyle = "#0d6efd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  datos.forEach((v, i) => {
    const x = pad + i * pasoX;
    const y = alto - pad - ((v - min) / rango) * (alto - pad * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Puntos
  ctx.fillStyle = "#ffd43b";
  datos.forEach((v, i) => {
    const x = pad + i * pasoX;
    const y = alto - pad - ((v - min) / rango) * (alto - pad * 2);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function obtenerEtiquetaMinijuego(posicion) {
  switch (posicion) {
    case "DEL": return "⚽ Práctica de Tiro";
    case "CM":  return "🎯 Tiro Libre";
    case "DEF": return "🦵 Barrida";
    case "GK":  return "🧤 Atajada";
    default:    return "🎯 Entrenamiento";
  }
}

// ============================================================
//  ACTUALIZACIÓN DE INTERFAZ
// ============================================================
function actualizarBloqueoMinijuegos() {
  const usado = jugador.minijuegosUsadosEstaTemporada >= CONFIG.MINIJUEGOS_POR_TEMPORADA;
  document.querySelectorAll(".btn-minijuego").forEach(function(btn) {
    btn.disabled = usado;
  });
  const aviso = document.getElementById("aviso-minijuego-usado");
  if (aviso) aviso.classList.toggle("hidden", !usado);
}

function actualizarInterfaz() {
  document.getElementById("j-nombre").innerText = jugador.nombre;
  document.getElementById("j-posicion").innerText = jugador.posicion;
  document.getElementById("j-edad").innerText = jugador.edad;
  const ovrActual = (jugador.atributos && typeof window.calcularOVR === "function")
    ? window.calcularOVR(jugador.atributos, jugador.posicion)
    : jugador.media;
  document.getElementById("j-media").innerText = ovrActual;
  document.getElementById("j-club").innerText = jugador.clubActual ? jugador.clubActual.nombre : "Sin Club";

  // Panel de atributos (progresión por atributos)
  const elAtributos = document.getElementById("j-atributos");
  if (elAtributos) {
    if (jugador.atributos && typeof window.atributosDePosicion === "function" && typeof window.nombreAtributo === "function") {
      const listado = window.atributosDePosicion(jugador.posicion)
        .map(function(a) { return (window.nombreAtributo(a) || a) + " " + jugador.atributos[a]; })
        .join(" · ");
      elAtributos.innerText = "⚙️ " + listado;
    } else {
      elAtributos.innerText = "";
    }
  }

  const imgClub = document.getElementById("club-img");
  if (jugador.clubActual && jugador.clubActual.imagen) {
    imgClub.src = jugador.clubActual.imagen;
    imgClub.style.display = "block";
  } else {
    imgClub.style.display = "none";
  }

  // Badge de rol
  const rolActual = rolEfectivo();
  const rolBadge = document.getElementById("rol-badge");
  if (rolBadge) {
    let badgeContent = "";
    if (rolActual.imagen && rolActual.imagen.indexOf("imagenes/") === 0) {
      badgeContent = `<img src="${rolActual.imagen}" alt="${rolActual.nombre}" style="width:54px;height:54px;object-fit:contain;filter:drop-shadow(0 0 8px ${rolActual.color});" onerror="imgFallback(this, '${rolActual.emoji}')">`;
    } else {
      badgeContent = `<span style="font-size:2rem;">${rolActual.emoji}</span>`;
    }
    rolBadge.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        ${badgeContent}
        <span style="font-size:0.7rem;font-weight:700;color:${rolActual.color};text-transform:uppercase;letter-spacing:1px;">${rolActual.nombre}</span>
      </div>
    `;
  }

  const entrenamientoAgotado = jugador.entrenamientosUsadosEstaTemporada >= CONFIG.ENTRENAMIENTOS_POR_TEMPORADA;
  const btnEntrenarAtributos = document.getElementById("btn-entrenar-atributos");
  if (btnEntrenarAtributos) {
    btnEntrenarAtributos.disabled = entrenamientoAgotado;
  }

  // Etiqueta del botón de minijuego específico
  const btnMinijuego = document.getElementById("btn-minijuego-especifico");
  if (btnMinijuego) {
    btnMinijuego.innerText = obtenerEtiquetaMinijuego(jugador.posicion);
    btnMinijuego.disabled = jugador.minijuegosUsadosEstaTemporada >= CONFIG.MINIJUEGOS_POR_TEMPORADA;
    if (jugador.posicion === "DEF") {
      document.getElementById("btnPatearTL").onclick = detenerBarrida;
    } else {
      document.getElementById("btnPatearTL").onclick = detenerTiroLibre;
    }
  }

  actualizarBloqueoMinijuegos();

  const btnEvento = document.getElementById("btn-evento-unico");
  const msgEspera = document.getElementById("mensaje-espera-eventos");
  const cardEvento = document.getElementById("evento-card");
  const nombreEvento = document.getElementById("evento-nombre");

  if (jugador.eventoDisponibleActual) {
    btnEvento.classList.remove("hidden");
    msgEspera.classList.add("hidden");
    const evConfig = eventoEnIdioma(configsEventos[jugador.eventoDisponibleActual]);
    const tituloEvento = evConfig ? evConfig.titulo : "Evento Social";
    btnEvento.innerText = `⭐ Jugar evento: ${tituloEvento}`;
    if (nombreEvento) nombreEvento.innerText = tituloEvento;
    if (cardEvento) cardEvento.classList.add("tiene-evento");
  } else {
    btnEvento.classList.add("hidden");
    msgEspera.classList.remove("hidden");
    msgEspera.innerText = (typeof t === "function") ? t("sinEventos") : "No hay eventos sociales esta temporada.";
    if (nombreEvento) nombreEvento.innerText = (typeof t === "function") ? t("sinEventosTitulo") : "Sin eventos por ahora";
    if (cardEvento) cardEvento.classList.remove("tiene-evento");
  }

  renderizarHistorialIncremental();
}

// Renderiza el historial sin reconstruirlo entero (evita el efecto de recarga)
function renderizarHistorialIncremental() {
  const tbody = document.getElementById("tabla-temporadas-body");
  const total = jugador.historialTemporadas.length;
  const firma = total + "|" + jugador.nombre;

  // Si cambió la partida (nuevo jugador o menos filas), reconstruir una sola vez
  if (firma !== firmaHistorialRenderizada || filasHistorialRenderizadas > total) {
    tbody.innerHTML = "";
    filasHistorialRenderizadas = 0;
    firmaHistorialRenderizada = firma;
  }

  // Agregar sólo las filas que faltan (sin recrear las existentes)
  for (let i = filasHistorialRenderizadas; i < total; i++) {
    const t = jugador.historialTemporadas[i];
    const tr = document.createElement("tr");
    if (i === total - 1) tr.classList.add("nueva");
    tr.innerHTML = `
      <td>${t.temporada}</td>
      <td>${t.club}</td>
      <td>${t.partidos}</td>
      <td>${t.goles}</td>
      <td>${t.asistencias}</td>
      <td class="text-primary fw-bold">${(t.media != null) ? t.media : "-"}</td>
      <td><small class="text-warning fw-bold">${t.trofeos}</small></td>
    `;
    tbody.appendChild(tr);
  }
  filasHistorialRenderizadas = total;
}
